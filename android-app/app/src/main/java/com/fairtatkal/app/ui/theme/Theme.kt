package com.fairtatkal.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val WebLightColorScheme = lightColorScheme(
    primary = WebPrimary,
    onPrimary = Color.White,
    secondary = WebIndigo,
    onSecondary = Color.White,
    tertiary = WebAmber,
    background = WebBackground,
    onBackground = WebText,
    surface = WebSurface,
    onSurface = WebText,
    surfaceVariant = WebBorder,
    onSurfaceVariant = WebMuted,
    outline = WebBorder
)

private val DarkColorScheme = darkColorScheme(
    primary = WebIndigo,
    onPrimary = Color.White,
    secondary = WebPrimary,
    background = Color(0xFF020617), // Slate-950
    onBackground = Color.White,
    surface = Color(0xFF0F172A), // Slate-900
    onSurface = Color.White
)

@Composable
fun FairTatkalTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else WebLightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        shapes = Shapes,
        typography = Typography,
        content = content
    )
}
