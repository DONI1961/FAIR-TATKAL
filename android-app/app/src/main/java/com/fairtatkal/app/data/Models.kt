package com.fairtatkal.app.data

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: Int? = null,
    val name: String,
    val email: String,
    val points: Int = 100
)

@Serializable
data class Journey(
    val id: Int? = null,
    val train_number: Int,
    val train_name: String,
    val from_station: String,
    val to_station: String,
    val departure_time: String,
    val departure_date: String, // String representation of date
    val arrival_time: String,
    val arrival_date: String,
    val seats: List<Int>,
    val fare: List<Int>,
    val tatkal: Boolean,
    val closing_time: String,
    val opening_date: String,
    val opening_time: String,
    val duration: Int,
    val closing_date: String,
    val published: Int? = null // From the JOIN query
)

@Serializable
data class TrainResponse(
    val ok: Boolean,
    val journeys: List<Journey> = emptyList(),
    val message: String? = null
)

@Serializable
enum class SeatClass {
    ECONOMY, BUSINESS, FIRST
}

@Serializable
data class Booking(
    val id: Int? = null,
    val user_email: String,
    val journey_id: Int,
    val seat_class: String,
    val paid: Boolean = false,
    val status: String,
    val selected_at: String? = null
)
