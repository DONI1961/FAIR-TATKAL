package com.fairtatkal.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import com.fairtatkal.app.ui.MainViewModel


import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fairtatkal.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(viewModel: MainViewModel, onSearchSubmit: (String, String, String) -> Unit) {
    var date by remember { mutableStateOf("2026-04-15") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(WebBackground)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            colors = CardDefaults.cardColors(containerColor = WebSurface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            shape = MaterialTheme.shapes.extraLarge
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                // Header with Search Icon
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Surface(
                        modifier = Modifier.size(48.dp),
                        shape = MaterialTheme.shapes.medium,
                        color = Color(0xFFEFF6FF) // Blue-50
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = null,
                                tint = WebPrimary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                    Column {
                        Text(
                            "Find your train",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = WebText
                        )
                        Text(
                            "Search by station pair and continue",
                            style = MaterialTheme.typography.bodySmall,
                            color = WebMuted
                        )
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Error State
                viewModel.errorState?.let { error ->
                    Text(
                        text = error,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                }

                // Input Fields
                Text("From", style = MaterialTheme.typography.labelMedium, color = WebText, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                
                var fromExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = fromExpanded,
                    onExpandedChange = { fromExpanded = it }
                ) {
                    SearchTextField(
                        value = viewModel.fromStation,
                        onValueChange = { 
                            viewModel.onFromQueryChange(it)
                            fromExpanded = viewModel.fromSuggestions.isNotEmpty()
                        },
                        placeholder = "e.g. Mumbai Central",
                        modifier = Modifier.menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = fromExpanded,
                        onDismissRequest = { fromExpanded = false },
                        modifier = Modifier.background(Color.White)
                    ) {
                        viewModel.fromSuggestions.forEach { suggestion ->
                            DropdownMenuItem(
                                text = { Text(suggestion) },
                                onClick = {
                                    viewModel.fromStation = suggestion
                                    viewModel.fromSuggestions = emptyList()
                                    fromExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text("To", style = MaterialTheme.typography.labelMedium, color = WebText, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))

                var toExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = toExpanded,
                    onExpandedChange = { toExpanded = it }
                ) {
                    SearchTextField(
                        value = viewModel.toStation,
                        onValueChange = { 
                            viewModel.onToQueryChange(it)
                            toExpanded = viewModel.toSuggestions.isNotEmpty()
                        },
                        placeholder = "e.g. New Delhi",
                        modifier = Modifier.menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = toExpanded,
                        onDismissRequest = { toExpanded = false },
                        modifier = Modifier.background(Color.White)
                    ) {
                        viewModel.toSuggestions.forEach { suggestion ->
                            DropdownMenuItem(
                                text = { Text(suggestion) },
                                onClick = {
                                    viewModel.toStation = suggestion
                                    viewModel.toSuggestions = emptyList()
                                    toExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text("Date", style = MaterialTheme.typography.labelMedium, color = WebText, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                SearchTextField(
                    value = date,
                    onValueChange = { date = it },
                    placeholder = "YYYY-MM-DD",
                    leadingIcon = { Icon(Icons.Default.Event, contentDescription = null, tint = WebMuted, modifier = Modifier.size(20.dp)) }
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Action Area
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = WebBackground,
                    shape = MaterialTheme.shapes.large
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        if (viewModel.isLoading) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = WebPrimary)
                        } else {
                            Text(
                                "Booking flow intact",
                                style = MaterialTheme.typography.bodySmall,
                                color = WebMuted
                            )
                        }
                        Button(
                            onClick = { onSearchSubmit(viewModel.fromStation, viewModel.toStation, date) },
                            colors = ButtonDefaults.buttonColors(containerColor = WebText),
                            shape = CircleShape,
                            enabled = !viewModel.isLoading,
                            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Search", fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}


@Composable
fun SearchTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    leadingIcon: @Composable (() -> Unit)? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = { Text(placeholder, color = WebMuted) },
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        singleLine = true,
        leadingIcon = leadingIcon,
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedContainerColor = WebBackground,
            focusedContainerColor = Color.White,
            unfocusedBorderColor = WebBorder,
            focusedBorderColor = WebPrimary,
            focusedLabelColor = WebPrimary
        )
    )
}
