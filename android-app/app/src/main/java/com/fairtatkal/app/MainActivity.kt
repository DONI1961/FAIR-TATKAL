package com.fairtatkal.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.NavOptionsBuilder
import androidx.navigation.NavOptions
import androidx.navigation.NavGraph.Companion.findStartDestination
import com.fairtatkal.app.data.AppRepository
import com.fairtatkal.app.data.ApiService
import com.fairtatkal.app.data.Journey
import com.fairtatkal.app.data.SupabaseManager
import com.fairtatkal.app.ui.MainViewModel
import com.fairtatkal.app.ui.screens.LoginScreen
import com.fairtatkal.app.ui.screens.SearchScreen
import com.fairtatkal.app.ui.screens.TrainListScreen
import com.fairtatkal.app.ui.screens.BookingScreen

import com.fairtatkal.app.ui.theme.FairTatkalTheme
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private val apiService = ApiService()
    private val repository = AppRepository(apiService)
    private lateinit var viewModel: MainViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel = MainViewModel(repository)

        setContent {
            FairTatkalTheme {
                val navController = rememberNavController()
                var isLoggedIn by remember { mutableStateOf(false) }

                // Check initial auth state
                LaunchedEffect(Unit) {
                    isLoggedIn = SupabaseManager.client.auth.currentSessionOrNull() != null
                }

                NavHost(
                    navController = navController, 
                    startDestination = if (isLoggedIn) "search" else "login"
                ) {
                    composable("login") {
                        LoginScreen(onLoginClick = {
                            isLoggedIn = true 
                            navController.navigate("search") {
                                popUpTo("login") { inclusive = true }
                            }
                        })
                    }
                    composable("search") {
                        SearchScreen(
                            viewModel = viewModel,
                            onSearchSubmit = { _, _, date ->
                                viewModel.searchTrains(date) {
                                    navController.navigate("results")
                                }
                            }
                        )
                    }
                    composable("results") {
                        TrainListScreen(
                            journeys = viewModel.journeys,
                            onTrainClick = { journey ->
                                viewModel.selectJourney(journey)
                                navController.navigate("booking")
                            }
                        )
                    }
                    composable("booking") {
                        val journey = viewModel.selectedJourney
                        if (journey != null) {
                            BookingScreen(
                                journey = journey,
                                viewModel = viewModel,
                                onJoinLottery = {
                                    navController.popBackStack("search", inclusive = false)
                                }
                            )
                        }
                    }

                }
            }
        }
    }
}

