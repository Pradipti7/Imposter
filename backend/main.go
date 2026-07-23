package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type GamePhase string

const (
	PhaseSetup    GamePhase = "setup"
	PhaseReveal   GamePhase = "reveal"
	PhaseDiscuss  GamePhase = "discuss"
	PhaseVoting   GamePhase = "voting"
	PhaseResult   GamePhase = "result"
	PhaseGameOver GamePhase = "gameover"
)

type Player struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Word     string `json:"word,omitempty"`
	IsImpost bool   `json:"isImpost,omitempty"`
	Votes    int    `json:"votes,omitempty"`
	Eliminated bool  `json:"eliminated,omitempty"`
}

type WordPair struct {
	Normal string `json:"normal"`
	Impost string `json:"impost"`
}

type Game struct {
	ID             string           `json:"id"`
	Players        []Player         `json:"players"`
	MaxPlayers     int              `json:"maxPlayers"`
	Phase          GamePhase        `json:"phase"`
	WordPair       WordPair         `json:"wordPair"`
	CurrentReveal  int              `json:"currentReveal"`
	Votes          map[int]int      `json:"votes"`
	VotingActive   bool             `json:"votingActive"`
	EliminatedIDs  []int            `json:"eliminatedIds"`
	Winner         string           `json:"winner,omitempty"`
	ImpostRevealed bool             `json:"impostRevealed,omitempty"`
}

type GameStore struct {
	mu    sync.RWMutex
	games map[string]*Game
}

var store = &GameStore{
	games: make(map[string]*Game),
}

var wordPairs = []WordPair{
	{Normal: "Pizza", Impost: "Tacos"},
	{Normal: "Beach", Impost: "Mountain"},
	{Normal: "Dog", Impost: "Parrot"},
	{Normal: "Car", Impost: "Boat"},
	{Normal: "Coffee", Impost: "Smoothie"},
	{Normal: "Laptop", Impost: "TV"},
	{Normal: "Guitar", Impost: "Trumpet"},
	{Normal: "Shoes", Impost: "Hat"},
	{Normal: "Rain", Impost: "Snow"},
	{Normal: "Sun", Impost: "Star"},
	{Normal: "Book", Impost: "Comic"},
	{Normal: "Hospital", Impost: "School"},
	{Normal: "Airplane", Impost: "Train"},
	{Normal: "Snake", Impost: "Frog"},
	{Normal: "Christmas", Impost: "Halloween"},
	{Normal: "Piano", Impost: "Flute"},
	{Normal: "Tiger", Impost: "Bear"},
	{Normal: "Clock", Impost: "Candle"},
	{Normal: "River", Impost: "Desert"},
	{Normal: "Bridge", Impost: "Tower"},
	{Normal: "Castle", Impost: "Tent"},
	{Normal: "Rocket", Impost: "Balloon"},
	{Normal: "Whale", Impost: "Eagle"},
	{Normal: "Ice Cream", Impost: "Popcorn"},
	{Normal: "Microphone", Impost: "Guitar"},
	{Normal: "Bicycle", Impost: "Skateboard"},
	{Normal: "Diamond", Impost: "Pearl"},
	{Normal: "Volcano", Impost: "Cave"},
	{Normal: "Submarine", Impost: "Airplane"},
	{Normal: "Camera", Impost: "Mirror"},
	{Normal: "Umbrella", Impost: "Towel"},
	{Normal: "Helmet", Impost: "Backpack"},
	{Normal: "Basketball", Impost: "Soccer"},
	{Normal: "Pen", Impost: "Brush"},
	{Normal: "Candle", Impost: "Flashlight"},
	{Normal: "Jungle", Impost: "Arctic"},
	{Normal: "Drums", Impost: "Violin"},
	{Normal: "Tent", Impost: "Castle"},
	{Normal: "Helicopter", Impost: "Kite"},
	{Normal: "Fork", Impost: "Chopsticks"},
	{Normal: "Chair", Impost: "Bed"},
	{Normal: "Window", Impost: "Roof"},
	{Normal: "Key", Impost: "Remote"},
	{Normal: "Train", Impost: "Bus"},
	{Normal: "Ship", Impost: "Kayak"},
	{Normal: "Apple", Impost: "Grapes"},
	{Normal: "Elephant", Impost: "Giraffe"},
	{Normal: "Glasses", Impost: "Earrings"},
	{Normal: "Hammer", Impost: "Saw"},
	{Normal: "Jellyfish", Impost: "Butterfly"},
}

func generateGameID() string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, 6)
	for i := range result {
		result[i] = chars[rand.Intn(len(chars))]
	}
	return string(result)
}

func createGameHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MaxPlayers int `json:"maxPlayers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request")
		return
	}

	if req.MaxPlayers < 4 || req.MaxPlayers > 20 {
		respondError(w, http.StatusBadRequest, "Players must be between 4 and 20")
		return
	}

	gameID := generateGameID()
	game := &Game{
		ID:            gameID,
		Players:       []Player{},
		MaxPlayers:    req.MaxPlayers,
		Phase:         PhaseSetup,
		Votes:         make(map[int]int),
		EliminatedIDs: []int{},
	}

	store.mu.Lock()
	store.games[gameID] = game
	store.mu.Unlock()

	respondJSON(w, http.StatusCreated, game)
}

func addPlayerHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request")
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	if game.Phase != PhaseSetup {
		respondError(w, http.StatusBadRequest, "Game already started")
		return
	}

	if len(game.Players) >= game.MaxPlayers {
		respondError(w, http.StatusBadRequest, "Game is full")
		return
	}

	player := Player{
		ID:   len(game.Players) + 1,
		Name: req.Name,
	}
	game.Players = append(game.Players, player)

	respondJSON(w, http.StatusOK, game)
}

func startGameHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	store.mu.Lock()
	defer store.mu.Unlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	if len(game.Players) != game.MaxPlayers {
		respondError(w, http.StatusBadRequest, fmt.Sprintf("Need exactly %d players to start", game.MaxPlayers))
		return
	}

	if game.Phase != PhaseSetup {
		respondError(w, http.StatusBadRequest, "Game already started")
		return
	}

	game.WordPair = wordPairs[rand.Intn(len(wordPairs))]
	impostIdx := rand.Intn(len(game.Players))
	game.Players[impostIdx].IsImpost = true

	for i := range game.Players {
		if game.Players[i].IsImpost {
			game.Players[i].Word = game.WordPair.Impost
		} else {
			game.Players[i].Word = game.WordPair.Normal
		}
	}

	game.Phase = PhaseReveal
	game.CurrentReveal = 0

	respondJSON(w, http.StatusOK, game)
}

func getGameHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	store.mu.RLock()
	defer store.mu.RUnlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	respondJSON(w, http.StatusOK, game)
}

func getPlayerWordHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]
	playerID := vars["playerId"]

	store.mu.RLock()
	defer store.mu.RUnlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	pID := 0
	fmt.Sscanf(playerID, "%d", &pID)

	for _, p := range game.Players {
		if p.ID == pID {
			respondJSON(w, http.StatusOK, map[string]interface{}{
				"name":     p.Name,
				"word":     p.Word,
				"isImpost": p.IsImpost,
				"playerId": p.ID,
			})
			return
		}
	}

	respondError(w, http.StatusNotFound, "Player not found")
}

func nextRevealHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	store.mu.Lock()
	defer store.mu.Unlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	game.CurrentReveal++

	if game.CurrentReveal >= len(game.Players) {
		game.Phase = PhaseDiscuss
	}

	respondJSON(w, http.StatusOK, game)
}

func startVotingHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	store.mu.Lock()
	defer store.mu.Unlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	game.Phase = PhaseVoting
	game.VotingActive = true
	game.Votes = make(map[int]int)

	for i := range game.Players {
		game.Players[i].Votes = 0
	}

	respondJSON(w, http.StatusOK, game)
}

func voteHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	var req struct {
		TargetID int `json:"targetId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request")
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	if !game.VotingActive {
		respondError(w, http.StatusBadRequest, "Voting not active")
		return
	}

	targetEliminated := false
	for _, p := range game.Players {
		if p.ID == req.TargetID && p.Eliminated {
			targetEliminated = true
			break
		}
	}
	if targetEliminated {
		respondError(w, http.StatusBadRequest, "Cannot vote for eliminated player")
		return
	}

	for i := range game.Players {
		if game.Players[i].ID == req.TargetID {
			game.Players[i].Eliminated = true
			game.EliminatedIDs = append(game.EliminatedIDs, req.TargetID)

			if game.Players[i].IsImpost {
				game.Phase = PhaseGameOver
				game.Winner = "villagers"
				game.ImpostRevealed = true
			} else {
				remaining := 0
				for _, p := range game.Players {
					if !p.Eliminated && !p.IsImpost {
						remaining++
					}
				}
				if remaining <= 1 {
					game.Phase = PhaseGameOver
					game.Winner = "impostor"
					game.ImpostRevealed = true
				} else {
					game.Phase = PhaseResult
				}
			}
			break
		}
	}

	game.VotingActive = false

	respondJSON(w, http.StatusOK, game)
}

func continueGameHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	store.mu.Lock()
	defer store.mu.Unlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	game.Phase = PhaseVoting
	game.VotingActive = true
	game.Votes = make(map[int]int)

	for i := range game.Players {
		game.Players[i].Votes = 0
	}

	respondJSON(w, http.StatusOK, game)
}

func resetGameHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	store.mu.Lock()
	defer store.mu.Unlock()

	game, ok := store.games[gameID]
	if !ok {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	players := make([]Player, len(game.Players))
	for i, p := range game.Players {
		players[i] = Player{ID: p.ID, Name: p.Name}
	}

	game.Players = players
	game.Phase = PhaseSetup
	game.Votes = make(map[int]int)
	game.CurrentReveal = 0
	game.VotingActive = false
	game.EliminatedIDs = []int{}
	game.Winner = ""
	game.ImpostRevealed = false

	respondJSON(w, http.StatusOK, game)
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func main() {
	rand.Seed(time.Now().UnixNano())

	r := mux.NewRouter()
	r.HandleFunc("/api/game", createGameHandler).Methods("POST")
	r.HandleFunc("/api/game/{gameId}", getGameHandler).Methods("GET")
	r.HandleFunc("/api/game/{gameId}/player", addPlayerHandler).Methods("POST")
	r.HandleFunc("/api/game/{gameId}/start", startGameHandler).Methods("POST")
	r.HandleFunc("/api/game/{gameId}/player/{playerId}/word", getPlayerWordHandler).Methods("GET")
	r.HandleFunc("/api/game/{gameId}/next-reveal", nextRevealHandler).Methods("POST")
	r.HandleFunc("/api/game/{gameId}/start-voting", startVotingHandler).Methods("POST")
	r.HandleFunc("/api/game/{gameId}/vote", voteHandler).Methods("POST")
	r.HandleFunc("/api/game/{gameId}/continue", continueGameHandler).Methods("POST")
	r.HandleFunc("/api/game/{gameId}/reset", resetGameHandler).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	fmt.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
