# CORTEXIA Design System

## Brand Identity

### Logo
- **Brain icon** with circuit patterns
- **Left hemisphere**: Cyan to blue gradient (#3DD5F3 → #0D47A1)
- **Right hemisphere**: Pink to purple gradient (#E040FB → #6A1B9A)
- **Digital pixels** emanating from right side

### Color Palette

#### Primary Colors
- **Primary**: `#0891d4` - Main brand color (cyan/blue)
- **Primary Dark**: `#0b5394` - Hover states
- **Primary Light**: `#3DD5F3` - Accents

#### Secondary Colors
- **Secondary**: `#AB47BC` - Purple accent
- **Secondary Dark**: `#6A1B9A` - Deep purple

#### Semantic Colors
- **Success**: `#10b981` - Confirmations, success states
- **Danger**: `#dc3545` - Errors, destructive actions
- **Warning**: `#f59e0b` - Warnings, caution

#### Neutral Colors
- **Gray 900**: `#1f2937` - Primary text
- **Gray 800**: `#374151`
- **Gray 700**: `#4b5563`
- **Gray 600**: `#6b7280` - Secondary text
- **Gray 500**: `#9ca3af`
- **Gray 400**: `#d1d5db` - Borders
- **Gray 300**: `#e5e7eb`
- **Gray 200**: `#f3f4f6`
- **Gray 100**: `#f9fafb` - Backgrounds
- **White**: `#ffffff`

### Typography

#### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Helvetica Neue', Arial, sans-serif;
```

#### Font Sizes
- **H1**: 32px (header titles)
- **H2**: 28px (section titles)
- **H3**: 20px
- **Body**: 14-15px
- **Small**: 13px
- **Caption**: 12px

#### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Spacing Scale
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 40px

### Border Radius
- **sm**: 6px
- **default**: 8px
- **lg**: 12px
- **xl**: 16px

### Shadows
- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **default**: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

## UI Components

### Buttons
- **Primary**: Filled cyan/blue, white text
- **Secondary**: White background, gray border, gray text
- **Danger**: Filled red, white text
- **Sizes**: Regular (10px 20px), Large (14px 32px)
- **States**: Default, Hover, Active, Disabled

### Form Inputs
- **Border**: 1px solid gray-300
- **Padding**: 10px 14px
- **Font size**: 14px
- **Focus**: Primary color border with light shadow
- **Hover**: Gray-400 border

### Icons
- **Size**: 20x20px for labels, 16x16px for inline
- **Style**: Filled, rounded
- **Color**: Gray-600 for neutral, primary for active

## Design Principles

1. **Clean & Professional**: No emojis, minimal decoration
2. **Consistent**: Use design tokens (colors, spacing, typography)
3. **Accessible**: High contrast ratios, clear focus states
4. **Responsive**: Adapt to different screen sizes
5. **Modern**: Inspired by Notion, Slack, Microsoft Teams
6. **Subtle Animations**: Smooth transitions (0.15s ease)

## Inspiration Sources
- **Notion**: Clean, document-focused interface
- **Slack**: Professional messaging, clear hierarchy
- **Microsoft Teams**: Enterprise-ready, accessible
- **Otter.ai**: AI-focused, meeting transcription specialist
