package com.fairtatkal.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ConfirmationNumber
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fairtatkal.app.data.Journey
import com.fairtatkal.app.ui.MainViewModel
import com.fairtatkal.app.ui.theme.*
import java.util.Locale


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingScreen(journey: Journey, viewModel: MainViewModel, onJoinLottery: () -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    var selectedClass by remember { mutableStateOf("Economy") }
    val classes = listOf("Economy", "Business", "First Class")
    val scrollState = rememberScrollState()

    val minutes = viewModel.secondsRemaining / 60
    val seconds = viewModel.secondsRemaining % 60
    val timeDisplay = String.format(Locale.getDefault(), "%02d:%02d", minutes, seconds)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(WebBackground)
            .verticalScroll(scrollState)
    ) {
        // Decorative background accents (blobs)
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(300.dp)
                .offset(x = 100.dp, y = (-50).dp)
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0xFFE0E7FF).copy(alpha = 0.5f), Color.Transparent)
                    )
                )
        )
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .size(250.dp)
                .offset(x = (-50).dp, y = 50.dp)
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0xFFDBEAFE).copy(alpha = 0.4f), Color.Transparent)
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            Card(
                modifier = Modifier
                    .fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = WebSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 16.dp),
                shape = MaterialTheme.shapes.extraLarge,
                border = BorderStroke(1.dp, Color.White)
            ) {
                Box {
                    // Top Gradient Border
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(WebPrimary, WebIndigo, Color(0xFFC026D3))
                                )
                            )
                    )

                    Column(
                        modifier = Modifier
                            .padding(24.dp)
                            .padding(top = 12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Timer Section
                        Surface(
                            color = if (viewModel.lotteryStatus == "open") Color(0xFFEEF2FF) else Color(0xFFFEF2F2),
                            shape = CircleShape,
                            border = BorderStroke(1.dp, if (viewModel.lotteryStatus == "open") Color(0xFFE0E7FF) else Color(0xFFFECACA))
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    Icons.Default.Schedule,
                                    contentDescription = null,
                                    tint = if (viewModel.lotteryStatus == "open") WebIndigo else Color.Red,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    (if (viewModel.lotteryStatus == "open") "Lottery Closes In" else "Lottery Closed").uppercase(),
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Black,
                                        letterSpacing = 1.sp
                                    ),
                                    color = if (viewModel.lotteryStatus == "open") WebIndigo else Color.Red
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Real Timer Display
                        Text(
                            if (viewModel.lotteryStatus == "open") timeDisplay else "--:--",
                            style = MaterialTheme.typography.displayMedium.copy(
                                fontWeight = FontWeight.Black,
                                letterSpacing = (-2).sp
                            ),
                            color = WebText
                        )

                        HorizontalDivider(modifier = Modifier.padding(vertical = 24.dp), color = WebBorder.copy(alpha = 0.5f))

                        Text(
                            "Reserve Your Seat",
                            style = MaterialTheme.typography.headlineLarge.copy(
                                fontWeight = FontWeight.Black,
                                brush = Brush.linearGradient(listOf(WebText, WebMuted))
                            ),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Selected Train Chip
                        Surface(
                            color = Color.White,
                            shape = CircleShape,
                            shadowElevation = 2.dp,
                            border = BorderStroke(1.dp, WebBorder)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text("Join the lottery for train", style = MaterialTheme.typography.bodySmall, color = WebMuted)
                                Surface(
                                    color = WebIndigo,
                                    shape = MaterialTheme.shapes.small
                                ) {
                                    Text(
                                        "#${journey.train_number}",
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = Color.White
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(32.dp))

                        // Class Selection Label
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.ConfirmationNumber, contentDescription = null, tint = WebIndigo, modifier = Modifier.size(18.dp))
                            Text("Travel Class", style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold), color = WebText)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Class Selection Dropdown
                        ExposedDropdownMenuBox(
                            expanded = expanded,
                            onExpandedChange = { expanded = !expanded },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            OutlinedTextField(
                                value = selectedClass,
                                onValueChange = {},
                                readOnly = true,
                                trailingIcon = { Icon(Icons.Default.ExpandMore, null) },
                                modifier = Modifier
                                    .menuAnchor()
                                    .fillMaxWidth(),
                                shape = MaterialTheme.shapes.medium,
                                colors = OutlinedTextFieldDefaults.colors(
                                    unfocusedContainerColor = WebBackground.copy(alpha = 0.5f),
                                    focusedContainerColor = Color.White,
                                    unfocusedBorderColor = WebBorder,
                                    focusedBorderColor = WebIndigo
                                )
                            )
                            ExposedDropdownMenu(
                                expanded = expanded,
                                onDismissRequest = { expanded = false },
                                modifier = Modifier.background(Color.White)
                            ) {
                                classes.forEachIndexed { index, className ->
                                    val price = journey.fare.getOrElse(index) { journey.fare.last() }
                                    val available = journey.seats.getOrElse(index) { journey.seats.last() }
                                    DropdownMenuItem(
                                        text = { 
                                            Text("$className (₹$price) • $available left", fontWeight = FontWeight.SemiBold) 
                                        },
                                        onClick = {
                                            selectedClass = className
                                            expanded = false
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(40.dp))

                        // Submit Button
                        Button(
                            onClick = { 
                                viewModel.joinLottery(selectedClass) { success: Boolean ->
                                    if (success) {
                                        onJoinLottery()
                                    }
                                }
                            },

                            modifier = Modifier
                                .fillMaxWidth()
                                .height(64.dp),
                            enabled = !viewModel.isJoining && viewModel.lotteryStatus == "open",
                            shape = MaterialTheme.shapes.large,
                            colors = ButtonDefaults.buttonColors(containerColor = WebPrimary),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                if (viewModel.isJoining) {
                                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
                                } else {
                                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White.copy(alpha = 0.8f))
                                }
                                Text(
                                    if (viewModel.isJoining) "Joining..." else "Enter Lottery Now",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

