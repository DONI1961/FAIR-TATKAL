package com.fairtatkal.app.data

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.*

import kotlinx.serialization.json.Json

class ApiService {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                coerceInputValues = true
            })
        }
    }

    private val baseUrl = "http://10.0.2.2:5001"

    suspend fun getTrains(from: String, to: String, date: String, token: String? = null): TrainResponse {
        return try {
            client.get("$baseUrl/get_trains") {
                parameter("from_station", from)
                parameter("to_station", to)
                parameter("date", date)
                if (token != null) {
                    header("Authorization", "Bearer $token")
                }
            }.body()
        } catch (e: Exception) {
            e.printStackTrace()
            TrainResponse(ok = false, message = "Connection error: ${e.message}")
        }
    }

    suspend fun getOneTrain(journeyId: Int): Journey? {
        return try {
            val response: Map<String, Any> = client.get("$baseUrl/one_train") {
                parameter("journey_id", journeyId)
            }.body()
            if (response["ok"] == true) {
                null 
            } else null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun joinLottery(booking: Booking): Map<String, Any> {
        return try {
            client.post("$baseUrl/lottery") {
                contentType(io.ktor.http.ContentType.Application.Json)
                setBody(booking)
            }.body()
        } catch (e: Exception) {
            e.printStackTrace()
            mapOf("ok" to false, "message" to (e.message ?: "Network error"))
        }
    }

    suspend fun checkLotteryStatus(email: String, journeyId: Int): Map<String, Any> {
        return try {
            client.get("$baseUrl/check_lottery") {
                parameter("email", email)
                parameter("journey_id", journeyId)
            }.body()
        } catch (e: Exception) {
            e.printStackTrace()
            mapOf("ok" to false, "message" to (e.message ?: "Network error"))
        }
    }

    suspend fun getLotteryTime(journeyId: Int): Map<String, Any> {
        return try {
            client.get("$baseUrl/get_time") {
                parameter("journey_id", journeyId)
            }.body()
        } catch (e: Exception) {
            e.printStackTrace()
            mapOf("ok" to false, "message" to (e.message ?: "Network error"))
        }
    }
}

