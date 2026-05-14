package com.fairtatkal.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Train
import androidx.compose.material.icons.filled.TrendingFlat

import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fairtatkal.app.data.Journey
import com.fairtatkal.app.ui.theme.*

@Composable
fun TrainListScreen(journeys: List<Journey>, onTrainClick: (Journey) -> Unit) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(WebBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                "Train Results",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = WebText
            )
            Text(
                "Found ${journeys.size} available trains for your route.",
                style = MaterialTheme.typography.bodyMedium,
                color = WebMuted
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        items(journeys) { journey ->
            TrainCard(journey, onClick = { onTrainClick(journey) })
        }
        
        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun TrainCard(journey: Journey, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = WebSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = MaterialTheme.shapes.extraLarge,
        border = BorderStroke(1.dp, WebBorder)
    ) {
        Column {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF8FAFC)) // Slate-50 fallback
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Surface(
                        color = Color(0xFFE0E7FF), // Indigo-100
                        shape = MaterialTheme.shapes.medium,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Default.Train,
                                contentDescription = null,
                                tint = WebIndigo,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                    Text(
                        journey.train_name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = WebText
                    )
                    Surface(
                        color = Color(0xFFEEF2FF), // Indigo-50
                        shape = MaterialTheme.shapes.small,
                        border = BorderStroke(1.dp, Color(0xFFE0E7FF))
                    ) {
                        Text(
                            "#${journey.train_number}",
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = WebIndigo
                        )
                    }
                }
                
                if (journey.tatkal) {
                    Surface(
                        color = Color(0xFFFFF7ED), // Amber-50
                        shape = MaterialTheme.shapes.small,
                        border = BorderStroke(1.dp, Color(0xFFFED7AA))
                    ) {
                        Text(
                            "TATKAL",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            ),
                            color = WebAmber
                        )
                    }
                }
            }

            // Body
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Departure
                    Column(horizontalAlignment = Alignment.Start, modifier = Modifier.weight(1f)) {
                        Text(
                            journey.departure_time,
                            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black),
                            color = WebText
                        )
                        Text(journey.from_station, style = MaterialTheme.typography.labelMedium, color = WebMuted)
                    }

                    // Timeline
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    ) {
                        Surface(
                            color = WebBackground,
                            shape = CircleShape
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(Icons.Default.Schedule, contentDescription = null, modifier = Modifier.size(12.dp), tint = WebMuted)
                                Text(
                                    "${journey.duration / 60}h ${journey.duration % 60}m",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = WebMuted
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(modifier = Modifier.size(6.dp).clip(CircleShape).border(1.dp, WebIndigo, CircleShape).background(Color.White))
                            Box(modifier = Modifier.width(40.dp).height(1.dp).background(WebBorder))
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = WebBorder, modifier = Modifier.size(12.dp))
                            Box(modifier = Modifier.width(40.dp).height(1.dp).background(WebBorder))
                            Box(modifier = Modifier.size(6.dp).clip(CircleShape).border(1.dp, WebIndigo, CircleShape).background(Color.White))
                        }
                    }

                    // Arrival
                    Column(horizontalAlignment = Alignment.End, modifier = Modifier.weight(1f)) {
                        Text(
                            journey.arrival_time,
                            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black),
                            color = WebText
                        )
                        Text(journey.to_station, style = MaterialTheme.typography.labelMedium, color = WebMuted, textAlign = TextAlign.End)
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Action logic from web: "Starts from"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Starts from".uppercase(), style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp), color = WebMuted)
                        Text("₹${journey.fare.minOrNull() ?: 0}", style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Black), color = WebIndigo)
                    }
                    
                    Button(
                        onClick = onClick,
                        colors = ButtonDefaults.buttonColors(containerColor = WebIndigo),
                        shape = MaterialTheme.shapes.medium,
                        contentPadding = PaddingValues(horizontal = 16.dp)
                    ) {
                        Text("Book Now", fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Footer - Class Selection
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color(0xFFF8FAFC).copy(alpha = 0.7f)
            ) {
                Column {
                    HorizontalDivider(thickness = 0.5.dp, color = WebBorder)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {

                    val classes = listOf("Economy", "Business", "First Class")
                    classes.forEachIndexed { index, className ->
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clickable { onClick() }
                                .padding(vertical = 12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(className.uppercase(), style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold), color = WebMuted)
                            Text("₹${journey.fare.getOrElse(index) { journey.fare.last() }}", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = WebText)
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                                Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(WebEmerald))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("${journey.seats.getOrElse(index) { journey.seats.last() }} Available", style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold), color = WebEmerald)
                            }
                        }
                        if (index < classes.size - 1) {
                            Box(modifier = Modifier.width(1.dp).height(40.dp).background(WebBorder).align(Alignment.CenterVertically))
                        }
                    }
                }
            }
        }
    }
}
}
