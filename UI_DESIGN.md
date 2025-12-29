# Loumi - UI Design Specification

## Overview

ChatGPT-inspired interface with privacy-centric elements. Muted, elegant color palette focused on usability over decoration.

---

## Layout Structure

### Desktop (1280px+)

```
+------------------+----------------------------------------+
|                  |                                        |
|    SIDEBAR       |            MAIN CHAT AREA              |
|    (280px)       |            (flexible)                  |
|                  |                                        |
|  - New Chat      |  +----------------------------------+  |
|  - Search        |  |         HEADER BAR               |  |
|  - Folders       |  |  Model Selector | Toggles | Menu |  |
|  - Conversations |  +----------------------------------+  |
|                  |                                        |
|                  |  +----------------------------------+  |
|                  |  |                                  |  |
|                  |  |        MESSAGE AREA              |  |
|                  |  |        (scrollable)              |  |
|                  |  |        (768px max-width)         |  |
|                  |  |                                  |  |
|                  |  +----------------------------------+  |
|                  |                                        |
|  - Settings      |  +----------------------------------+  |
|  - Privacy Tier  |  |        INPUT AREA                |  |
|                  |  |  Textarea + Send Button          |  |
|                  |  +----------------------------------+  |
|                  |                                        |
+------------------+----------------------------------------+
```

### Mobile (<768px)

- Sidebar becomes a slide-out drawer (hamburger menu)
- Full-width message area
- FAB for new conversation
- Model selector moves to bottom sheet
- Input area stays fixed at bottom

### Tablet (768px - 1279px)

- Collapsible sidebar (icon-only mode)
- Touch-optimized hit targets (44px minimum)

---

## Color Palette

### Light Mode

```css
/* Background Hierarchy */
--bg-primary: #FFFFFF;           /* Main content area */
--bg-secondary: #F7F7F8;         /* Sidebar, cards */
--bg-tertiary: #ECECEC;          /* Hover states */
--bg-message-user: #F4F4F4;      /* User message bubbles */
--bg-message-ai: #FFFFFF;        /* AI message area */

/* Text Hierarchy */
--text-primary: #0D0D0D;         /* Headings, main content */
--text-secondary: #6B6B6B;       /* Secondary info, metadata */
--text-tertiary: #8E8E8E;        /* Placeholders, hints */
--text-disabled: #B4B4B4;        /* Disabled states */

/* Accent Colors */
--accent-primary: #10A37F;       /* Primary actions (green) */
--accent-primary-hover: #0D8A6C;
--accent-secondary: #5436DA;     /* Privacy-related actions */

/* Privacy Tier Colors */
--tier-community: #6B7280;       /* Neutral gray */
--tier-private: #3B82F6;         /* Trustworthy blue */
--tier-sovereign: #10B981;       /* Secure green */

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Borders & Dividers */
--border-light: #E5E5E5;
--border-medium: #D4D4D4;
--border-focus: #10A37F;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Dark Mode

```css
/* Background Hierarchy */
--bg-primary: #212121;           /* Main content area */
--bg-secondary: #171717;         /* Sidebar */
--bg-tertiary: #2F2F2F;          /* Hover states */
--bg-message-user: #2F2F2F;      /* User message bubbles */
--bg-message-ai: #212121;        /* AI message area */

/* Text Hierarchy */
--text-primary: #ECECEC;
--text-secondary: #9B9B9B;
--text-tertiary: #6B6B6B;
--text-disabled: #4A4A4A;

/* Accent Colors (same, good contrast) */
--accent-primary: #10A37F;
--accent-primary-hover: #1DB589;
--accent-secondary: #7C5CFF;

/* Privacy Tier Colors (brighter for dark mode) */
--tier-community: #9CA3AF;
--tier-private: #60A5FA;
--tier-sovereign: #34D399;

/* Borders */
--border-light: #2F2F2F;
--border-medium: #404040;
--border-focus: #10A37F;
```

---

## Typography

### Font Stack

```css
/* Primary Font (UI & Body) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Oxygen', 'Ubuntu', sans-serif;

/* Code/Monospace */
font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo,
             Consolas, 'Liberation Mono', monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Page Title) | 24px | 600 | 1.33 | -0.02em |
| H2 (Section) | 20px | 600 | 1.4 | -0.01em |
| H3 (Subsection) | 16px | 600 | 1.5 | 0 |
| Body | 16px | 400 | 1.6 | 0 |
| Body Small | 14px | 400 | 1.5 | 0 |
| Caption | 12px | 400 | 1.4 | 0.02em |
| Button | 14px | 500 | 1.2 | 0.01em |
| Code | 14px | 400 | 1.5 | 0 |

---

## Components

### 1. Conversation Sidebar

**Dimensions**
- Width: 280px (desktop), 320px max (mobile drawer)
- Background: `#F7F7F8` (light), `#171717` (dark)
- Border: 1px solid `#E5E5E5` on right edge

**Structure**
```
+------------------------+
|  [Logo] Loumi    [+]   |  <- Header: 56px
+------------------------+
|  [Search...]           |  <- Search: 40px
+------------------------+
|  Today                 |  <- Date group label
|  > Conversation 1      |
|  > Conversation 2      |
|  Yesterday             |
|  > Conversation 3      |
|  Previous 7 Days       |
|  v Folder Name         |  <- Collapsible folders
|    > Nested Conv       |
+------------------------+
|  [Settings] [?] [Tier] |  <- Footer: 56px
+------------------------+
```

**Interactive States**
- Default: Text `#6B6B6B`, no background
- Hover: Background `#ECECEC`, text `#0D0D0D`
- Active: Background `#ECECEC`, left border 2px `#10A37F`
- Focus: Outline 2px `#10A37F` with 2px offset

**Conversation Item**
```tsx
<div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg
                hover:bg-neutral-100 dark:hover:bg-neutral-800
                cursor-pointer transition-colors duration-150">
  <span className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
    Conversation title here...
  </span>
  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
    <button className="p-1 hover:bg-neutral-200 rounded">
      {/* Pin icon */}
    </button>
    <button className="p-1 hover:bg-neutral-200 rounded">
      {/* More icon */}
    </button>
  </div>
</div>
```

**Model Indicator**
- Small colored dot (6px) next to conversation title
- OpenAI: Green (`#10A37F`)
- Anthropic: Orange/Tan (`#D97757`)
- Google: Blue (`#4285F4`)

---

### 2. Header Bar (56px)

```
+------------------------------------------------------------------+
|  [Model Selector v]    |    [Web] [Think]    |    [Privacy] [...] |
+------------------------------------------------------------------+
```

**Model Selector** (Left)
- Dropdown trigger showing current model name + icon
- Width: 200px minimum, auto-expand
- Click opens grouped dropdown

**Toggles** (Center)
- Web Search: Magnifying glass icon (16px)
- Thinking Mode: Brain icon (16px)
- Pill-style: 32px height, 8px gap
- Active: `#10A37F` fill, white icon
- Inactive: Ghost style, `#6B6B6B` icon

**Right Side**
- Privacy Tier Badge
- More menu (3 dots): Export, Clear, Settings

---

### 3. Message Display

#### User Messages (Right-aligned)

```tsx
<div className="flex justify-end mb-6">
  <div className="max-w-[85%] md:max-w-[70%]">
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-3xl
                    px-5 py-3 text-neutral-900 dark:text-neutral-100">
      <p className="text-base leading-relaxed">User message content...</p>
    </div>
    <div className="text-xs text-neutral-500 text-right mt-1.5 mr-2">
      12:34 PM
    </div>
  </div>
</div>
```

**Styling**
- Background: `#F4F4F4`
- Border-radius: 24px
- Padding: 12px 20px
- Max-width: 70% desktop, 85% mobile
- Timestamp: Below, right-aligned, 12px

#### AI Messages (Left-aligned, no bubble)

```tsx
<div className="mb-6">
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600
                    flex items-center justify-center">
      <LoumiIcon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">Claude Sonnet 4</span>
        <span className="text-xs text-neutral-500">12:35 PM</span>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {/* Rendered markdown content */}
      </div>
    </div>
  </div>
  <div className="flex items-center gap-2 mt-3 ml-12">
    <button className="p-1.5 hover:bg-neutral-100 rounded-md">
      <CopyIcon className="w-4 h-4 text-neutral-500" />
    </button>
    <button className="p-1.5 hover:bg-neutral-100 rounded-md">
      <RegenerateIcon className="w-4 h-4 text-neutral-500" />
    </button>
    <button className="p-1.5 hover:bg-neutral-100 rounded-md">
      <ThumbsUpIcon className="w-4 h-4 text-neutral-500" />
    </button>
    <button className="p-1.5 hover:bg-neutral-100 rounded-md">
      <ThumbsDownIcon className="w-4 h-4 text-neutral-500" />
    </button>
  </div>
</div>
```

**AI Avatar**
- 32px circle
- Background: `#10A37F`
- White Loumi icon centered

**Model Label**
- 14px, semi-bold
- Adjacent timestamp in `#8E8E8E`

**Actions** (hover reveal on desktop, always visible on mobile)
- Copy, Regenerate, Good/Bad feedback
- Icons: 16px, `#8E8E8E`
- Hover: Background `#ECECEC`, icon `#0D0D0D`

---

### 4. Thinking Display

#### Collapsed (Default after streaming)

```tsx
<div className="ml-12 mb-4">
  <button className="flex items-center gap-2 text-sm text-neutral-500
                     hover:text-neutral-700 transition-colors">
    <ChevronRightIcon className="w-4 h-4" />
    <BrainIcon className="w-4 h-4" />
    <span>View reasoning (2.3s)</span>
  </button>
</div>
```

#### Expanded

```tsx
<div className="ml-12 mb-4">
  <button className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
    <ChevronDownIcon className="w-4 h-4" />
    <BrainIcon className="w-4 h-4" />
    <span>Reasoning (2.3s)</span>
  </button>
  <div className="pl-6 border-l-2 border-neutral-200 dark:border-neutral-700">
    <div className="text-sm text-neutral-600 dark:text-neutral-400
                    italic leading-relaxed">
      <p>Let me think about this step by step...</p>
    </div>
  </div>
</div>
```

**Styling**
- Left border: 2px solid `#E5E5E5`
- Text: Italic, `#6B6B6B`, 14px
- Animation: 200ms ease-out expand/collapse

#### Streaming State

```tsx
<div className="ml-12 mb-4">
  <div className="flex items-center gap-2 text-sm text-neutral-500">
    <div className="animate-pulse flex gap-1">
      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animation-delay-150" />
      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animation-delay-300" />
    </div>
    <span>Thinking...</span>
  </div>
</div>
```

---

### 5. Web Search Results

#### Inline Citations

```tsx
<span className="inline-flex items-center">
  <span>According to recent reports</span>
  <button className="inline-flex items-center justify-center w-5 h-5
                     ml-0.5 text-xs font-medium text-teal-600
                     hover:bg-teal-50 rounded-full">
    [1]
  </button>
  <span>, the market has...</span>
</span>
```

#### Sources Panel (Collapsible)

```tsx
<div className="ml-12 mt-4 mb-6">
  <button className="flex items-center gap-2 text-sm font-medium
                     text-neutral-600 hover:text-neutral-800 mb-3">
    <GlobeIcon className="w-4 h-4" />
    <span>5 sources</span>
    <ChevronDownIcon className="w-4 h-4" />
  </button>

  <div className="grid gap-2">
    {sources.map((source, i) => (
      <a key={i} href={source.url} target="_blank"
         className="flex items-start gap-3 p-3 rounded-lg border
                    border-neutral-200 hover:border-neutral-300
                    hover:bg-neutral-50 transition-colors">
        <img src={source.favicon} className="w-4 h-4 mt-0.5 rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {source.title}
          </p>
          <p className="text-xs text-neutral-500 truncate">
            {source.domain}
          </p>
        </div>
        <span className="text-xs text-neutral-400 font-medium">
          [{i + 1}]
        </span>
      </a>
    ))}
  </div>
</div>
```

**Card Styling**
- Border: 1px solid `#E5E5E5`
- Border-radius: 8px
- Padding: 12px
- Favicon: 16px, rounded 2px

---

### 6. Code Blocks

```tsx
<div className="relative my-4 rounded-lg overflow-hidden border
                border-neutral-200 dark:border-neutral-700">
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-2
                  bg-neutral-100 dark:bg-neutral-800 border-b
                  border-neutral-200 dark:border-neutral-700">
    <span className="text-xs font-medium text-neutral-600
                     dark:text-neutral-400">
      typescript
    </span>
    <button className="flex items-center gap-1.5 text-xs text-neutral-500
                       hover:text-neutral-700 transition-colors">
      <CopyIcon className="w-3.5 h-3.5" />
      <span>Copy code</span>
    </button>
  </div>

  {/* Code */}
  <pre className="p-4 overflow-x-auto text-sm">
    <code className="font-mono text-neutral-800 dark:text-neutral-200">
      {/* Syntax highlighted code */}
    </code>
  </pre>
</div>
```

**Styling**
- Header: `#F7F7F8` (light), `#2F2F2F` (dark)
- Code: White (light), dark gray (dark)
- Font: Monospace, 14px
- Syntax: GitHub Light/Dark theme
- Copy → "Copied!" with checkmark for 2s

---

### 7. Input Area

```
+------------------------------------------------------------------+
|  +------------------------------------------------------+  [^]   |
|  |  Message Loumi...                                    |  Send  |
|  |                                                      |        |
|  +------------------------------------------------------+        |
|  [Attach] [Voice]        Loumi can make mistakes.       [Model]  |
+------------------------------------------------------------------+
```

**Textarea**
- Min-height: 52px (1 line + padding)
- Max-height: 200px (then scroll)
- Auto-resize on content
- Border: 1px solid `#D4D4D4`, 24px radius
- Focus: 2px `#10A37F` border
- Padding: 12px 16px

**Send Button**
- Circular, 36px diameter
- Background: `#10A37F` when has content
- Background: `#ECECEC` when empty (disabled)
- Icon: Up arrow, white when active

**Footer**
- "Loumi can make mistakes. Consider checking important information."
- 12px, `#8E8E8E`, centered

---

### 8. Privacy Components

#### Tier Badge

```tsx
const tierStyles = {
  community: "bg-neutral-100 text-neutral-700 border-neutral-200",
  private: "bg-blue-50 text-blue-700 border-blue-200",
  sovereign: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

<div className={`inline-flex items-center gap-1.5 px-2.5 py-1
                 rounded-full text-xs font-medium border ${tierStyles[tier]}`}>
  <TierIcon tier={tier} className="w-3 h-3" />
  <span>{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
</div>
```

**Icons**
- Community: Users icon
- Private: Shield icon
- Sovereign: Lock icon

#### PII Indicator

```tsx
<div className="inline-flex items-center gap-1.5 px-2 py-1
                bg-amber-50 border border-amber-200 rounded-md text-xs">
  <ShieldAlertIcon className="w-3.5 h-3.5 text-amber-600" />
  <span className="text-amber-700">2 PII items sanitized</span>
  <button className="ml-1 text-amber-600 hover:text-amber-800">
    <InfoIcon className="w-3 h-3" />
  </button>
</div>
```

**Popover shows:**
- What was detected: "Email address", "Phone number"
- Replacement: "john@example.com" -> "[EMAIL_1]"
- Toggle to view original

#### Audit Trail

```tsx
<div className="space-y-3">
  <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center
                    justify-center flex-shrink-0">
      <SendIcon className="w-4 h-4 text-teal-600" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Request to Claude Sonnet 4</span>
        <span className="text-xs text-neutral-500">2 min ago</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2 py-0.5 bg-white
                         border rounded text-xs">
          <TokenIcon className="w-3 h-3 mr-1" />
          1,234 tokens
        </span>
        <span className="inline-flex items-center px-2 py-0.5 bg-amber-50
                         border border-amber-200 rounded text-xs text-amber-700">
          <ShieldIcon className="w-3 h-3 mr-1" />
          1 PII sanitized
        </span>
      </div>
      <div className="mt-2 text-xs text-neutral-500">
        Provider: Anthropic | Retention: 30 days | Encrypted: Yes
      </div>
    </div>
  </div>
</div>
```

---

### 9. Model Selector Dropdown

```tsx
<Popover>
  <PopoverTrigger asChild>
    <button className="flex items-center gap-2 px-3 py-2 rounded-lg
                       hover:bg-neutral-100 transition-colors">
      <ModelIcon model={currentModel} className="w-5 h-5" />
      <span className="font-medium">{currentModel.name}</span>
      <ChevronDownIcon className="w-4 h-4 text-neutral-500" />
    </button>
  </PopoverTrigger>

  <PopoverContent className="w-72 p-2">
    {/* OpenAI Group */}
    <div className="mb-2">
      <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500
                      uppercase tracking-wider">
        OpenAI
      </div>
      <ModelOption model="gpt-4o" description="Fastest, multimodal" />
      <ModelOption model="gpt-4-turbo" description="Powerful, cost-effective" />
      <ModelOption model="o1" description="Advanced reasoning" badge="NEW" />
    </div>

    {/* Anthropic Group */}
    <div className="mb-2">
      <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500
                      uppercase tracking-wider">
        Anthropic
      </div>
      <ModelOption model="claude-opus-4" description="Most capable" />
      <ModelOption model="claude-sonnet-4" description="Balanced" />
      <ModelOption model="claude-haiku-3.5" description="Fast & efficient" />
    </div>

    {/* Google Group */}
    <div>
      <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500
                      uppercase tracking-wider">
        Google
      </div>
      <ModelOption model="gemini-2-flash" description="Cutting edge" />
      <ModelOption model="gemini-1.5-pro" description="Long context" />
      <ModelOption model="gemini-1.5-flash" description="Speed optimized" />
    </div>
  </PopoverContent>
</Popover>
```

**Model Option Component**
```tsx
<button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                   hover:bg-neutral-100 dark:hover:bg-neutral-800">
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500
                  to-emerald-600 flex items-center justify-center">
    <ModelIcon className="w-5 h-5 text-white" />
  </div>
  <div className="flex-1 text-left">
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">{model.name}</span>
      {badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase
                         bg-teal-100 text-teal-700 rounded">
          {badge}
        </span>
      )}
    </div>
    <p className="text-xs text-neutral-500">{description}</p>
  </div>
  {isSelected && <CheckIcon className="w-4 h-4 text-teal-600" />}
</button>
```

**Model Icon Backgrounds**
- OpenAI: Green gradient
- Anthropic: Orange/tan gradient
- Google: Blue gradient

---

## Interactions

### Streaming Flow

```
[User sends message]
     |
     v
[Input clears, disabled]
     |
     v
[Scroll to bottom]
     |
     v
[AI avatar appears with typing indicator]
     |
     v
[If thinking: Show "Thinking..." with animated dots]
     |
     v
[Thinking text streams (if enabled)]
     |
     v
[Response streams character-by-character]
     |
     v
[Thinking block collapses automatically]
     |
     v
[Action buttons fade in]
     |
     v
[Input re-enabled]
```

**Streaming animation:**
- Characters appear with cursor effect
- Smooth scroll follows content
- User scroll-up pauses auto-scroll
- "Scroll to bottom" button appears

### Model Switching

1. User opens model selector
2. Models shown in grouped list
3. On select: Smooth transition (no reload)
4. Toast: "Switched to Claude Sonnet 4"
5. Next message uses new model
6. Badge updates in header

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Cmd/Ctrl + K` | Open model selector |
| `Cmd/Ctrl + /` | Toggle sidebar |
| `Cmd/Ctrl + Shift + N` | New conversation |
| `Cmd/Ctrl + Shift + S` | Toggle web search |
| `Cmd/Ctrl + Shift + T` | Toggle thinking mode |
| `Esc` | Close modal/popover |

### Empty State

```tsx
<div className="flex flex-col items-center justify-center h-full py-16">
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500
                  to-emerald-600 flex items-center justify-center mb-6">
    <LoumiLogo className="w-10 h-10 text-white" />
  </div>

  <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
    How can I help you today?
  </h1>

  <p className="text-neutral-500 mb-8">
    Your conversations are protected by {tierName} privacy.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
    {suggestions.map((suggestion) => (
      <button key={suggestion.id}
              onClick={() => startConversation(suggestion.prompt)}
              className="p-4 text-left border rounded-xl hover:bg-neutral-50
                         hover:border-neutral-300 transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <suggestion.icon className="w-4 h-4 text-teal-600" />
          <span className="font-medium text-sm">{suggestion.title}</span>
        </div>
        <p className="text-sm text-neutral-500">{suggestion.description}</p>
      </button>
    ))}
  </div>
</div>
```

### Burner Session Mode

**Activation:**
1. Click "Burner Session" (flame icon)
2. Modal: Select duration (1h, 4h, 24h)
3. Confirm starts session

**Visual Treatment:**
- Header: Subtle red/orange accent border
- "Burner" badge next to model selector
- Sidebar: Countdown timer
- Messages: Dashed border (ephemeral feel)

**On Expiry:**
- Modal: "Burner session ended. All data destroyed."
- Return to normal interface
- No trace in history

---

## Animation & Motion

### Principles

- **Purposeful**: Communicate state or guide attention
- **Quick**: 150-200ms (never >300ms)
- **Subtle**: Not flashy or distracting
- **Consistent**: Same animation for same action

### Timing

| Element | Duration | Easing |
|---------|----------|--------|
| Sidebar open/close | 200ms | ease-out |
| Dropdown appear | 150ms | ease-out |
| Message appear | 200ms | ease-out |
| Thinking expand | 200ms | ease-in-out |
| Button hover | 100ms | ease |
| Copy success | 200ms | ease-out |
| Toast notification | 250ms | ease-out |

### Streaming Cursor

```css
@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.streaming-cursor::after {
  content: '|';
  animation: cursor-blink 1s infinite;
  color: var(--accent-primary);
}
```

---

## Responsive Breakpoints

```css
sm: 640px   /* Large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large displays */
```

### Mobile (<768px)

- Sidebar: Drawer (hamburger menu)
- Model selector: Bottom sheet
- Input: Touch-optimized (larger targets)
- Swipe: Conversation navigation
- FAB: New conversation
- Timestamps: Always visible
- Actions: Always visible
- Message max-width: 90%

### Touch Optimization

- Minimum tap target: 44x44px
- Increased spacing between interactive elements
- Pull-to-refresh for conversation sync
- Long-press context menus

---

## Accessibility

### Color Contrast

- All text: WCAG AA (4.5:1 body, 3:1 large)
- Interactive elements: 3:1 minimum
- Don't rely on color alone

### Keyboard Navigation

- All elements focusable
- Visible focus indicators (2px outline)
- Logical tab order
- Skip link to main content
- Escape closes modals

### Screen Readers

- Proper heading hierarchy (h1 > h2 > h3)
- Descriptive button labels (not just icons)
- Live regions for streaming
- Status announcements for loading

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        loumi: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#9af5de',
          300: '#5fe9c9',
          400: '#2dd4b0',
          500: '#10a37f',  // Primary accent
          600: '#0d8a6c',
          700: '#0f6d57',
          800: '#115746',
          900: '#12473b',
        },
        tier: {
          community: '#6B7280',
          private: '#3B82F6',
          sovereign: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        'chat': '768px',
      },
      animation: {
        'thinking-pulse': 'thinking-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'thinking-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config
```

---

## Required shadcn/ui Components

```bash
# Core UI
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add dialog
npx shadcn@latest add sheet           # Mobile sidebar
npx shadcn@latest add tooltip
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add skeleton        # Loading states
npx shadcn@latest add toast           # Notifications
npx shadcn@latest add toggle          # Web search/thinking
npx shadcn@latest add collapsible     # Thinking blocks
npx shadcn@latest add command         # Search/command palette
```

### Custom Components to Build

1. `ModelSelector` - Grouped dropdown with icons
2. `TierBadge` - Privacy tier indicator
3. `MessageBubble` - Chat message display
4. `ThinkingBlock` - Collapsible reasoning
5. `WebSearchCard` - Source display
6. `CodeBlock` - Syntax highlighted code
7. `AuditEntry` - Audit trail item
8. `PIIIndicator` - Sanitization notice
9. `ConversationItem` - Sidebar conversation
10. `FolderTree` - Drag-drop folder structure

---

## Icons (Lucide React)

```bash
npm install lucide-react
```

**Required Icons:**
- `MessageSquare` - Conversations
- `Search` - Search
- `Brain` - Thinking mode
- `Globe` - Web search
- `Shield` - Privacy/Private tier
- `Lock` - Sovereign tier
- `Users` - Community tier
- `Copy` - Copy action
- `RefreshCw` - Regenerate
- `ThumbsUp` / `ThumbsDown` - Feedback
- `ChevronDown` / `ChevronRight` - Expand/collapse
- `Plus` - New conversation
- `Settings` - Settings
- `MoreHorizontal` - More menu
- `Send` - Send message
- `Flame` - Burner session
- `AlertTriangle` - PII warning

---

## Summary

### ChatGPT Patterns Emulated

- Clean, minimal chrome
- Left sidebar for history
- Centered message stream (768px max)
- Fixed bottom input
- Subtle hover reveals
- Grays + one accent color
- Dark mode parity

### Loumi Differentiators

- Privacy tier badge (always visible)
- Model attribution per message
- Thinking blocks (visible reasoning)
- PII sanitization indicators
- Audit trail button
- Multi-provider grouping
- Burner session mode

This design creates a professional, trustworthy aesthetic that reinforces Loumi's privacy-first positioning while maintaining the familiar, comfortable UX patterns users expect from modern AI chat interfaces.
