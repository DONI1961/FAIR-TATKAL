package com.fairtatkal.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*

import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.ConfirmationNumber
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
import com.fairtatkal.app.ui.theme.*

@Composable
fun LoginScreen(onLoginClick: () -> Unit) {
    val scrollState = rememberScrollState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(WebBackground)
            .verticalScroll(scrollState)
    ) {
        // Top Gradient Section
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(400.dp)
                .background(
                    Brush.linearGradient(WebHeaderGradient)
                )
                .padding(24.dp)
        ) {
            Column(
                modifier = Modifier.align(Alignment.CenterStart)
            ) {
                Surface(
                    color = Color.White.copy(alpha = 0.15f),
                    shape = CircleShape,
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f))
                ) {
                    Text(
                        "New travel dashboard",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelMedium,
                        color = Color.White
                    )
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Text(
                    "Book smarter journeys with a cleaner, faster rail experience.",
                    style = MaterialTheme.typography.displaySmall.copy(
                        fontWeight = FontWeight.Bold,
                        lineHeight = 40.sp
                    ),
                    color = Color.White
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    "Search routes, join lotteries, track ticket status, and complete payment from one polished workspace.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.White.copy(alpha = 0.85f)
                )
            }
        }

        // Bottom Interaction Section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .offset(y = (-40).dp) // Card overlap
                .padding(horizontal = 16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = WebSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 12.dp),
                shape = MaterialTheme.shapes.extraLarge
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Ticket Icon
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(MaterialTheme.shapes.medium)
                            .background(Brush.linearGradient(WebIconGradient), MaterialTheme.shapes.medium),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.ConfirmationNumber,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(
                        "Welcome back".uppercase(),
                        style = MaterialTheme.typography.labelLarge.copy(
                            letterSpacing = 4.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        color = WebMuted
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        "Sign in to continue",
                        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                        color = WebText
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        "Use your Google account to access search, booking, and ticket updates.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = WebMuted,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    // Features List
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = WebBackground,
                        shape = MaterialTheme.shapes.large
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            FeatureRow(
                                icon = Icons.Default.RocketLaunch,
                                text = "Fast entry into train search and booking",
                                iconColor = WebPrimary
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            FeatureRow(
                                icon = Icons.Default.CheckCircle,
                                text = "Track selection and payment status clearly",
                                iconColor = WebEmerald
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    Button(
                        onClick = onLoginClick,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = WebText),
                        shape = CircleShape
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Continue with Google", fontSize = 16.sp, fontWeight = FontWeight.Medium)
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FeatureRow(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String, iconColor: Color) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White,
        shape = MaterialTheme.shapes.medium,
        shadowElevation = 1.dp
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconColor,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = text,
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                color = WebText
            )
        }
    }
}
