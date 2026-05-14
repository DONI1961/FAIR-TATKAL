package com.fairtatkal.app.ui

import androidx.compose.runtime.*
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fairtatkal.app.data.AppRepository
import com.fairtatkal.app.data.Booking
import com.fairtatkal.app.data.Journey
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel(private val repository: AppRepository) : ViewModel() {

    // Auth State
    var currentUserEmail by mutableStateOf("user@example.com") // Mocked for now
        private set

    // Search State
    var fromStation by mutableStateOf("")
        internal set
    var toStation by mutableStateOf("")
        internal set
    var fromSuggestions by mutableStateOf<List<String>>(emptyList())
        internal set
    var toSuggestions by mutableStateOf<List<String>>(emptyList())
        internal set
    
    // Results
    var journeys by mutableStateOf<List<Journey>>(emptyList())
        private set
    var isLoading by mutableStateOf(false)
        private set
    var errorState by mutableStateOf<String?>(null)
        private set

    // Booking State
    var selectedJourney by mutableStateOf<Journey?>(null)
        private set
    var lotteryStatus by mutableStateOf<String?>(null)
        private set
    var secondsRemaining by mutableIntStateOf(0)
        private set
    var isJoining by mutableStateOf(false)
        private set

    private var searchJob: Job? = null

    fun onFromQueryChange(query: String) {
        fromStation = query
        fromSuggestions = repository.getStationSuggestions(query)
    }

    fun onToQueryChange(query: String) {
        toStation = query
        toSuggestions = repository.getStationSuggestions(query)
    }

    fun searchTrains(date: String, onSearchResult: () -> Unit) {
        viewModelScope.launch {
            isLoading = true
            errorState = null
            val response = repository.getTrains(fromStation, toStation, date)
            if (response.ok) {
                journeys = response.journeys
                onSearchResult()
            } else {
                errorState = response.message ?: "Failed to find trains"
            }
            isLoading = false
        }
    }

    fun selectJourney(journey: Journey) {
        selectedJourney = journey
        fetchLotteryTimer(journey.id ?: 0)
    }

    private var timerJob: Job? = null

    private fun fetchLotteryTimer(journeyId: Int) {
        timerJob?.cancel()
        viewModelScope.launch {
            val response = repository.getLotteryTimer(journeyId)
            if (response["ok"] == true) {
                val seconds = (response["seconds"] as? Number)?.toInt() ?: 0
                secondsRemaining = seconds
                lotteryStatus = response["status"] as? String
                
                if (lotteryStatus == "open" && secondsRemaining > 0) {
                    startCountdown()
                }
            }
        }
    }

    private fun startCountdown() {
        timerJob = viewModelScope.launch {
            while (secondsRemaining > 0) {
                delay(1000)
                secondsRemaining--
            }
            lotteryStatus = "closed"
        }
    }


    fun joinLottery(seatClass: String, onJoined: (Boolean) -> Unit) {
        val journey = selectedJourney ?: return
        viewModelScope.launch {
            isJoining = true
            val booking = Booking(
                user_email = currentUserEmail,
                journey_id = journey.id ?: 0,
                seat_class = seatClass,
                status = "PENDING"
            )
            val response = repository.joinLottery(booking)
            onJoined(response["ok"] == true)
            isJoining = false
        }
    }
}
