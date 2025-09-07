# Frontend Theme & Portfolio Page Redesign Prompt

## Overview

Transform the crypto-risk-dashboard frontend to match a modern, sleek design inspired by the purple gradient theme from the Stakent platform and the sophisticated portfolio interface from CoinGecko. The goal is to create a premium, professional cryptocurrency dashboard with smooth animations, gradients, and enhanced visual hierarchy.

## Current State Analysis

- **Current Theme**: Basic light/dark mode with blue primary colors
- **Current Portfolio Cards**: Simple white/gray cards with basic shadows
- **Current Layout**: Standard grid layout with minimal visual appeal
- **Current Colors**: Blue primary (#3b82f6), standard grays, basic success/danger colors

## Design Inspiration Sources

1. **Stakent Platform**: Purple gradients, dark theme with purple/blue accents, smooth animations
2. **CoinGecko Portfolio**: Clean data tables, sophisticated card layouts, professional typography
3. **Modern Crypto Dashboards**: Glassmorphism effects, subtle animations, premium feel

## Theme Redesign Requirements

### 1. Color Palette Overhaul

Replace the current blue-based theme with a sophisticated purple gradient system:

**Primary Colors:**

- Primary Purple: `#8B5CF6` (violet-500)
- Primary Blue: `#3B82F6` (blue-500)
- Gradient Start: `#8B5CF6` (violet-500)
- Gradient End: `#3B82F6` (blue-500)
- Accent Purple: `#A855F7` (purple-500)
- Dark Purple: `#7C3AED` (violet-600)

**Background Colors:**

- Dark Mode Primary: `#0F0F23` (very dark blue-purple)
- Dark Mode Secondary: `#1A1A2E` (dark blue-purple)
- Dark Mode Card: `#16213E` (dark blue-gray)
- Light Mode Primary: `#FAFAFA` (off-white)
- Light Mode Secondary: `#F8F9FA` (light gray)
- Light Mode Card: `#FFFFFF` (white)

**Status Colors:**

- Success: `#10B981` (emerald-500)
- Warning: `#F59E0B` (amber-500)
- Danger: `#EF4444` (red-500)
- Info: `#06B6D4` (cyan-500)

### 2. Gradient System

Implement a comprehensive gradient system:

```css
/* Primary Gradients */
.gradient-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
}

.gradient-accent {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
}

/* Card Gradients */
.gradient-card {
  background: linear-gradient(
    145deg,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(59, 130, 246, 0.05) 100%
  );
}

/* Glassmorphism */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 3. Animation System

Implement smooth, professional animations:

```css
/* Hover Effects */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Gradient Animation */
.gradient-animate {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Pulse Animation */
.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite alternate;
}

@keyframes pulseGlow {
  from {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  }
  to {
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
  }
}
```

## Portfolio Page Redesign Requirements

### 1. Header Section Enhancement

Transform the current simple header into a sophisticated dashboard header:

**Features:**

- Gradient background with subtle animation
- Enhanced typography with better hierarchy
- Floating action button with gradient and glow effect
- Breadcrumb navigation with smooth transitions

**Layout:**

```tsx
<div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600">
  <div className="absolute inset-0 bg-black/20"></div>
  <div className="relative z-10">
    {/* Header content with enhanced styling */}
  </div>
</div>
```

### 2. Summary Cards Redesign

Replace the current basic metric cards with premium gradient cards:

**Design Elements:**

- Glassmorphism effect with subtle borders
- Gradient backgrounds with hover animations
- Enhanced icons with glow effects
- Smooth number animations
- Better typography hierarchy

**Card Structure:**

```tsx
<div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 backdrop-blur-sm border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105">
  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <div className="relative z-10 p-6">{/* Card content */}</div>
</div>
```

### 3. Portfolio Cards Complete Overhaul

Transform the current bland portfolio cards into sophisticated, CoinGecko-inspired cards:

**New Card Features:**

- **Glassmorphism Design**: Semi-transparent background with backdrop blur
- **Gradient Borders**: Subtle gradient borders that animate on hover
- **Enhanced Typography**: Better font weights, sizes, and spacing
- **Interactive Elements**: Smooth hover animations and micro-interactions
- **Status Indicators**: Enhanced risk level badges with gradients
- **Performance Charts**: Mini sparkline charts for 24h performance
- **Action Buttons**: Redesigned action buttons with hover effects

**Card Layout:**

```tsx
<div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-violet-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10">
  {/* Gradient overlay on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

  {/* Card content with enhanced styling */}
  <div className="relative z-10 p-6">
    {/* Header with portfolio name and arrow */}
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
          {portfolio.name}
        </h3>
        <p className="text-sm text-slate-400">
          {portfolio.holdings.length} assets
        </p>
      </div>
      <div className="p-2 rounded-full bg-slate-700/50 group-hover:bg-violet-500/20 transition-colors">
        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
      </div>
    </div>

    {/* Metrics with enhanced styling */}
    <div className="space-y-4">
      {/* Total Value with large, prominent display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">Total Value</span>
        <span className="text-2xl font-bold text-white">
          ${(portfolio.total_value_usd || 0).toLocaleString()}
        </span>
      </div>

      {/* Risk Level with gradient badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">Risk Level</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskGradient(riskScore)}`}
        >
          {riskLevel}
        </span>
      </div>

      {/* Performance with trend indicator */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">24h P&L</span>
        <div className="flex items-center space-x-2">
          <TrendingUp
            className={`w-4 h-4 ${(portfolio.total_profit_loss_percentage || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
          />
          <span
            className={`font-semibold ${(portfolio.total_profit_loss_percentage || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {(portfolio.total_profit_loss_percentage || 0) >= 0 ? "+" : ""}
            {(portfolio.total_profit_loss_percentage || 0).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>

    {/* Action buttons with enhanced styling */}
    <div className="mt-6 pt-4 border-t border-slate-700/50">
      <div className="flex space-x-4">
        <Link
          href={`/portfolios/${portfolio.id}/risk`}
          className="flex-1 text-center px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-violet-500/30 text-violet-300 hover:from-violet-500/30 hover:to-blue-500/30 hover:border-violet-400/50 transition-all duration-300 text-sm font-medium"
        >
          Risk Analysis
        </Link>
        <Link
          href={`/portfolios/${portfolio.id}/insights`}
          className="flex-1 text-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all duration-300 text-sm font-medium"
        >
          AI Insights
        </Link>
      </div>
    </div>
  </div>
</div>
```

### 4. Enhanced Risk Level Styling

Create gradient-based risk level indicators:

```tsx
const getRiskGradient = (riskScore: number) => {
  if (riskScore <= 3)
    return "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/30";
  if (riskScore <= 6)
    return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30";
  if (riskScore <= 8)
    return "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/30";
  return "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30";
};
```

### 5. Loading States Enhancement

Replace current skeleton loaders with animated gradient skeletons:

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg mb-2"></div>
  <div className="h-4 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 rounded-lg w-3/4"></div>
</div>
```

## Implementation Steps

### Step 1: Update Tailwind Configuration

1. Add new color palette to `tailwind.config.js`
2. Add custom gradient utilities
3. Add new animation keyframes
4. Add glassmorphism utilities

### Step 2: Update Global CSS

1. Add new CSS custom properties for the purple theme
2. Add gradient utility classes
3. Add animation keyframes
4. Update existing component classes

### Step 3: Update Theme Context

1. Enhance theme switching with smooth transitions
2. Add theme-specific gradient configurations
3. Update color scheme variables

### Step 4: Redesign Portfolio Components

1. Update `PortfoliosList.tsx` with new card designs
2. Enhance metric cards with gradients and animations
3. Add new utility functions for styling
4. Implement responsive design improvements

### Step 5: Add Micro-interactions

1. Implement hover animations
2. Add loading state animations
3. Create smooth transitions between states
4. Add focus states for accessibility

## Technical Requirements

### Dependencies to Add

```json
{
  "framer-motion": "^10.16.4",
  "lucide-react": "^0.294.0"
}
```

### Performance Considerations

- Use CSS transforms for animations (GPU accelerated)
- Implement `will-change` property for animated elements
- Use `transform3d` for better performance
- Optimize gradient animations with `background-size`

### Accessibility Requirements

- Maintain proper contrast ratios
- Ensure keyboard navigation works with new animations
- Add `prefers-reduced-motion` support
- Maintain focus indicators

## Expected Outcome

A premium, modern cryptocurrency dashboard that rivals professional trading platforms with:

- Sophisticated purple gradient theme
- Smooth, professional animations
- Enhanced visual hierarchy
- CoinGecko-inspired portfolio cards
- Glassmorphism design elements
- Responsive and accessible design
- Premium user experience

## Files to Modify

1. `tailwind.config.js` - Add new color palette and utilities
2. `app/globals.css` - Add gradient and animation styles
3. `contexts/ThemeContext.tsx` - Enhance theme system
4. `components/PortfoliosList.tsx` - Complete redesign
5. `components/ui/Skeleton.tsx` - Enhanced loading states
6. `lib/colors.ts` - Add new color utilities

This redesign will transform your dashboard from a basic interface into a premium, professional cryptocurrency portfolio management platform that users will love to interact with.
