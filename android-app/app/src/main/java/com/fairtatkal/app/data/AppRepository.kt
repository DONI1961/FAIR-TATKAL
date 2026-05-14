package com.fairtatkal.app.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class AppRepository(private val apiService: ApiService) {

    // Derived from the seeded IRCTC train catalog (matches Web)
    private val allStations = listOf(
        "Mumbai Central",
        "New Delhi",
        "Chennai",
        "Bangalore",
        "Varanasi",
        "Howrah",
        "Mumbai CSMT",
        "Pune",
        "Coimbatore",
        "Lucknow"
    )

    fun getStationSuggestions(query: String): List<String> {
        if (query.isBlank()) return emptyList()
        return allStations.filter { it.contains(query, ignoreCase = true) }
    }

    suspend fun getTrains(from: String, to: String, date: String): TrainResponse {
        return apiService.getTrains(from, to, date)
    }

    suspend fun joinLottery(booking: Booking): Map<String, Any> {
        return apiService.joinLottery(booking)
    }

    suspend fun getLotteryStatus(email: String, journeyId: Int): Map<String, Any> {
        return apiService.checkLotteryStatus(email, journeyId)
    }

    suspend fun getLotteryTimer(journeyId: Int): Map<String, Any> {
        return apiService.getLotteryTime(journeyId)
    }
}
