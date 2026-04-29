<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Apply stored colour-scheme preset immediately to prevent FOUC --}}
        <script>
            (function() {
                // Dark/light mode
                const appearance = '{{ $appearance ?? "system" }}';
                if (appearance === 'system') {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                    }
                }

                // Colour theme preset — stored as CSS variable map in localStorage
                const THEMES = {
                    'forest-grc':        { '--background': '#091413', '--card': '#0D1F1C', '--primary': '#408A71', '--border': '#285A48', '--muted': '#122B22', '--muted-foreground': '#7ABFA8', '--foreground': '#E0F5EC', '--ring': '#408A71', '--sidebar': '#091413' },
                    'midnight-ocean':    { '--background': '#060B14', '--card': '#0A1220', '--primary': '#3B82F6', '--border': '#1E3A5F', '--muted': '#0F1E33', '--muted-foreground': '#6B9BC7', '--foreground': '#DCE8F7', '--ring': '#3B82F6', '--sidebar': '#060B14' },
                    'crimson-court':     { '--background': '#100708', '--card': '#1A0C0E', '--primary': '#BE185D', '--border': '#5B1C28', '--muted': '#2A1015', '--muted-foreground': '#C09AAA', '--foreground': '#F5E0E2', '--ring': '#BE185D', '--sidebar': '#100708' },
                    'obsidian':          { '--background': '#080808', '--card': '#111111', '--primary': '#FAFAFA', '--border': '#2A2A2A', '--muted': '#1A1A1A', '--muted-foreground': '#888888', '--foreground': '#F0F0F0', '--ring': '#FAFAFA', '--sidebar': '#080808' },
                    'arctic-horizon':    { '--background': '#06101A', '--card': '#0A1828', '--primary': '#38BDF8', '--border': '#1B4060', '--muted': '#0F2035', '--muted-foreground': '#6BB5D8', '--foreground': '#D4E8F7', '--ring': '#38BDF8', '--sidebar': '#06101A' },
                    'amber-codex':       { '--background': '#0F0A00', '--card': '#1A1200', '--primary': '#D97706', '--border': '#4D3300', '--muted': '#261A00', '--muted-foreground': '#B08040', '--foreground': '#FBF0D0', '--ring': '#D97706', '--sidebar': '#0F0A00' },
                    'brass-leather':     { '--background': '#1C1714', '--card': '#231E19', '--primary': '#C9A962', '--border': '#5C4A30', '--muted': '#2A231C', '--muted-foreground': '#9A8060', '--foreground': '#F5E8C8', '--ring': '#C9A962', '--sidebar': '#1C1714' },
                    'violet-protocol':   { '--background': '#080612', '--card': '#0E0A1F', '--primary': '#7C3AED', '--border': '#3B1F7A', '--muted': '#160D30', '--muted-foreground': '#8B6FCC', '--foreground': '#E8D8FF', '--ring': '#7C3AED', '--sidebar': '#080612' },
                    'jade-empire':       { '--background': '#041210', '--card': '#071C17', '--primary': '#10B981', '--border': '#145A3D', '--muted': '#0A2620', '--muted-foreground': '#50B090', '--foreground': '#D0F5E8', '--ring': '#10B981', '--sidebar': '#041210' },
                    'rose-editorial':    { '--background': '#100810', '--card': '#1A0A1A', '--primary': '#E11D48', '--border': '#6B1B3A', '--muted': '#28101C', '--muted-foreground': '#C07090', '--foreground': '#FAE8F0', '--ring': '#E11D48', '--sidebar': '#100810' },
                    'solar-flare':       { '--background': '#0C0700', '--card': '#160E00', '--primary': '#F59E0B', '--border': '#503800', '--muted': '#201200', '--muted-foreground': '#C08030', '--foreground': '#FFF4D8', '--ring': '#F59E0B', '--sidebar': '#0C0700' },
                    'slate-bureau':      { '--background': '#0D1117', '--card': '#161B22', '--primary': '#58A6FF', '--border': '#30363D', '--muted': '#21262D', '--muted-foreground': '#8B949E', '--foreground': '#E6EDF3', '--ring': '#58A6FF', '--sidebar': '#0D1117' },
                    'indigo-vault':      { '--background': '#05070F', '--card': '#0A0E1F', '--primary': '#6366F1', '--border': '#2A3068', '--muted': '#111530', '--muted-foreground': '#6070C0', '--foreground': '#E0E4FF', '--ring': '#6366F1', '--sidebar': '#05070F' },
                    'phosphor-terminal': { '--background': '#000800', '--card': '#001200', '--primary': '#00FF41', '--border': '#003300', '--muted': '#001A00', '--muted-foreground': '#00B32A', '--foreground': '#00FF41', '--ring': '#00FF41', '--sidebar': '#000800' },
                    'polar-night':       { '--background': '#1B2027', '--card': '#232B35', '--primary': '#89B4FA', '--border': '#3B4A5A', '--muted': '#2C3540', '--muted-foreground': '#7D8B9C', '--foreground': '#CDD6F4', '--ring': '#89B4FA', '--sidebar': '#1B2027' },
                    'copper-circuit':       { '--background': '#100A06', '--card': '#1C120A', '--primary': '#B87333', '--border': '#5A3820', '--muted': '#241608', '--muted-foreground': '#908060', '--foreground': '#F5E8D8', '--ring': '#B87333', '--sidebar': '#100A06' },
                    'dracula':              { '--background': '#282A36', '--card': '#44475A', '--primary': '#BD93F9', '--border': '#6272A4', '--muted': '#3A3D4F', '--muted-foreground': '#6272A4', '--foreground': '#F8F8F2', '--ring': '#BD93F9', '--sidebar': '#21222C' },
                    'nord':                 { '--background': '#2E3440', '--card': '#3B4252', '--primary': '#88C0D0', '--border': '#4C566A', '--muted': '#434C5E', '--muted-foreground': '#7B88A0', '--foreground': '#ECEFF4', '--ring': '#88C0D0', '--sidebar': '#242933' },
                    'gruvbox':              { '--background': '#1D2021', '--card': '#282828', '--primary': '#FABD2F', '--border': '#504945', '--muted': '#3C3836', '--muted-foreground': '#928374', '--foreground': '#EBDBB2', '--ring': '#FABD2F', '--sidebar': '#161819' },
                    'tokyo-night':          { '--background': '#1A1B2E', '--card': '#24253D', '--primary': '#7AA2F7', '--border': '#3D4170', '--muted': '#2F3152', '--muted-foreground': '#565F89', '--foreground': '#C0CAF5', '--ring': '#7AA2F7', '--sidebar': '#16161E' },
                    'one-dark':             { '--background': '#21252B', '--card': '#282C34', '--primary': '#61AFEF', '--border': '#3E4451', '--muted': '#2C313A', '--muted-foreground': '#5C6370', '--foreground': '#ABB2BF', '--ring': '#61AFEF', '--sidebar': '#1B1F23' },
                    'synthwave':            { '--background': '#0D0221', '--card': '#1A0536', '--primary': '#FF2D78', '--border': '#5A0080', '--muted': '#200840', '--muted-foreground': '#9060CC', '--foreground': '#F0E8FF', '--ring': '#FF2D78', '--sidebar': '#0A0118' },
                    'cyberpunk':            { '--background': '#0A0A0A', '--card': '#111111', '--primary': '#FFE600', '--border': '#333300', '--muted': '#1A1A1A', '--muted-foreground': '#808080', '--foreground': '#FFE600', '--ring': '#FFE600', '--sidebar': '#050505' },
                    'blood-moon':           { '--background': '#0F0000', '--card': '#1F0505', '--primary': '#DC143C', '--border': '#6B1515', '--muted': '#2A0808', '--muted-foreground': '#B06060', '--foreground': '#FFE8E8', '--ring': '#DC143C', '--sidebar': '#080000' },
                    'deep-sea':             { '--background': '#020E12', '--card': '#051E24', '--primary': '#00CED1', '--border': '#0F4855', '--muted': '#082830', '--muted-foreground': '#409098', '--foreground': '#C8F0F5', '--ring': '#00CED1', '--sidebar': '#010A0E' },
                    'monokai':              { '--background': '#1C1E1F', '--card': '#272822', '--primary': '#A6E22E', '--border': '#49483E', '--muted': '#3E3D32', '--muted-foreground': '#75715E', '--foreground': '#F8F8F2', '--ring': '#A6E22E', '--sidebar': '#161718' },
                    'sakura':               { '--background': '#0D080E', '--card': '#1A0E1C', '--primary': '#FFB7C5', '--border': '#5C2050', '--muted': '#231028', '--muted-foreground': '#C080A0', '--foreground': '#FFE4EC', '--ring': '#FFB7C5', '--sidebar': '#09050A' },
                    'graphite':             { '--background': '#0E1015', '--card': '#171C24', '--primary': '#94A3B8', '--border': '#2D3748', '--muted': '#1E2530', '--muted-foreground': '#64748B', '--foreground': '#E2E8F0', '--ring': '#94A3B8', '--sidebar': '#0A0D12' },
                    'rust-protocol':        { '--background': '#0E0800', '--card': '#1C1000', '--primary': '#CE422B', '--border': '#603018', '--muted': '#281800', '--muted-foreground': '#A06040', '--foreground': '#FFF0E8', '--ring': '#CE422B', '--sidebar': '#080500' },
                    'sage-mist':            { '--background': '#0D1610', '--card': '#162018', '--primary': '#6BAE82', '--border': '#2E5038', '--muted': '#1C2C20', '--muted-foreground': '#80B090', '--foreground': '#D8EDE0', '--ring': '#6BAE82', '--sidebar': '#09100C' },
                    'vintage-wine':         { '--background': '#0C0608', '--card': '#1A0C10', '--primary': '#8B1A3A', '--border': '#4A1525', '--muted': '#241018', '--muted-foreground': '#A07080', '--foreground': '#F0E0E4', '--ring': '#8B1A3A', '--sidebar': '#080305' },
                    'ocean-depth':          { '--background': '#020818', '--card': '#050F2E', '--primary': '#1E90FF', '--border': '#103060', '--muted': '#0A183E', '--muted-foreground': '#5080B0', '--foreground': '#DCF0FF', '--ring': '#1E90FF', '--sidebar': '#010510' },
                    'lava-lamp':            { '--background': '#0A0005', '--card': '#15000C', '--primary': '#FF1493', '--border': '#600030', '--muted': '#200010', '--muted-foreground': '#C04080', '--foreground': '#FFE8F8', '--ring': '#FF1493', '--sidebar': '#070003' },
                    'moonstone':            { '--background': '#080D18', '--card': '#0F1828', '--primary': '#B8C8E0', '--border': '#1E3050', '--muted': '#162030', '--muted-foreground': '#7090B8', '--foreground': '#D8E8F8', '--ring': '#B8C8E0', '--sidebar': '#050810' },
                    'forest-night':         { '--background': '#050D07', '--card': '#0C1A0F', '--primary': '#2D6A4F', '--border': '#1E4030', '--muted': '#122218', '--muted-foreground': '#4A8060', '--foreground': '#D8F0E0', '--ring': '#2D6A4F', '--sidebar': '#030805' },
                    'catppuccin-mocha':     { '--background': '#1E1E2E', '--card': '#313244', '--primary': '#CBA6F7', '--border': '#585B70', '--muted': '#45475A', '--muted-foreground': '#A6ADC8', '--foreground': '#CDD6F4', '--ring': '#CBA6F7', '--sidebar': '#181825' },
                    'everforest':           { '--background': '#2D353B', '--card': '#3D484D', '--primary': '#A7C080', '--border': '#5C6A72', '--muted': '#475258', '--muted-foreground': '#9DA9A0', '--foreground': '#D3C6AA', '--ring': '#A7C080', '--sidebar': '#272E33' },
                    'solarized-dark':       { '--background': '#002B36', '--card': '#073642', '--primary': '#268BD2', '--border': '#0D4A58', '--muted': '#094050', '--muted-foreground': '#657B83', '--foreground': '#839496', '--ring': '#268BD2', '--sidebar': '#00212B' },
                    'kanagawa':             { '--background': '#1F1F28', '--card': '#2A2A37', '--primary': '#7E9CD8', '--border': '#54546D', '--muted': '#363646', '--muted-foreground': '#727169', '--foreground': '#DCD7BA', '--ring': '#7E9CD8', '--sidebar': '#16161D' },
                    'material-ocean':       { '--background': '#0F111A', '--card': '#1A1C25', '--primary': '#80CBC4', '--border': '#1F2233', '--muted': '#242635', '--muted-foreground': '#717CB4', '--foreground': '#8F93A2', '--ring': '#80CBC4', '--sidebar': '#090B10' },
                    'high-contrast':        { '--background': '#000000', '--card': '#0A0A0A', '--primary': '#00E5CC', '--border': '#333333', '--muted': '#111111', '--muted-foreground': '#BBBBBB', '--foreground': '#FFFFFF', '--ring': '#00E5CC', '--sidebar': '#000000' },
                    'ayu-dark':             { '--background': '#0D1017', '--card': '#131721', '--primary': '#E6B450', '--border': '#1D2433', '--muted': '#1C2030', '--muted-foreground': '#626A73', '--foreground': '#B3B1AD', '--ring': '#E6B450', '--sidebar': '#090E14' },
                    'mellow-purple':        { '--background': '#1A1A2E', '--card': '#252540', '--primary': '#9B8EC4', '--border': '#3A3A60', '--muted': '#2E2E50', '--muted-foreground': '#8080B0', '--foreground': '#E2DDFF', '--ring': '#9B8EC4', '--sidebar': '#141422' },
                    'github-dimmed':        { '--background': '#22272E', '--card': '#2D333B', '--primary': '#539BF5', '--border': '#444C56', '--muted': '#373E47', '--muted-foreground': '#768390', '--foreground': '#ADBAC7', '--ring': '#539BF5', '--sidebar': '#1C2128' },
                    'poimandres':           { '--background': '#1B1E28', '--card': '#252837', '--primary': '#89DDFF', '--border': '#3B4054', '--muted': '#303445', '--muted-foreground': '#767C9D', '--foreground': '#A6ACCD', '--ring': '#89DDFF', '--sidebar': '#171922' },
                    'rose-pine':            { '--background': '#191724', '--card': '#26233A', '--primary': '#EBBCBA', '--border': '#403D52', '--muted': '#31748F', '--muted-foreground': '#908CAA', '--foreground': '#E0DEF4', '--ring': '#EBBCBA', '--sidebar': '#1F1D2E' },
                    'vesper':               { '--background': '#101010', '--card': '#1C1C1C', '--primary': '#FFC799', '--border': '#303030', '--muted': '#242424', '--muted-foreground': '#888888', '--foreground': '#FFFFFF', '--ring': '#FFC799', '--sidebar': '#0A0A0A' },
                    'horizon':              { '--background': '#1C1E26', '--card': '#232530', '--primary': '#E95678', '--border': '#3D3F4F', '--muted': '#2E303E', '--muted-foreground': '#6C6F93', '--foreground': '#D5D8DA', '--ring': '#E95678', '--sidebar': '#16181F' },
                    'night-owl':            { '--background': '#011627', '--card': '#0D2137', '--primary': '#82AAFF', '--border': '#1D3B53', '--muted': '#0A1F33', '--muted-foreground': '#637777', '--foreground': '#D6DEEB', '--ring': '#82AAFF', '--sidebar': '#010E1A' },
                    'dune':                 { '--background': '#150F05', '--card': '#221805', '--primary': '#D4A853', '--border': '#5A3C10', '--muted': '#2E2208', '--muted-foreground': '#B09060', '--foreground': '#EEE0C0', '--ring': '#D4A853', '--sidebar': '#100C03' },
                    'gloom':                { '--background': '#111111', '--card': '#1D1D1D', '--primary': '#5EB5C5', '--border': '#333333', '--muted': '#272727', '--muted-foreground': '#777777', '--foreground': '#CCCCCC', '--ring': '#5EB5C5', '--sidebar': '#0A0A0A' },
                    'palenight':            { '--background': '#292D3E', '--card': '#32374C', '--primary': '#82AAFF', '--border': '#4E5579', '--muted': '#3C4055', '--muted-foreground': '#676E95', '--foreground': '#BFC7D5', '--ring': '#82AAFF', '--sidebar': '#212433' },
                    'mint':                 { '--background': '#F5FFFA', '--card': '#FFFFFF', '--primary': '#1A6B46', '--border': '#B0DDCC', '--muted': '#E8F8F0', '--muted-foreground': '#4A8A6A', '--foreground': '#0D2B1D', '--ring': '#1A6B46', '--sidebar': '#EAF8F0' },
                    'iceberg':              { '--background': '#161821', '--card': '#1E2132', '--primary': '#84A0C6', '--border': '#3D425B', '--muted': '#262A3F', '--muted-foreground': '#6B7089', '--foreground': '#C6C8D1', '--ring': '#84A0C6', '--sidebar': '#0E1019' },
                    'deep-forest':          { '--background': '#080E08', '--card': '#101A10', '--primary': '#4A7C59', '--border': '#204020', '--muted': '#162016', '--muted-foreground': '#608060', '--foreground': '#C8DCC8', '--ring': '#4A7C59', '--sidebar': '#050A05' },
                    'stark':                { '--background': '#FFFFFF', '--card': '#F2F2F2', '--primary': '#0A0A0A', '--border': '#CCCCCC', '--muted': '#E8E8E8', '--muted-foreground': '#444444', '--foreground': '#0A0A0A', '--ring': '#0A0A0A', '--sidebar': '#F8F8F8' },
                    'ink':                  { '--background': '#000000', '--card': '#111111', '--primary': '#FFFFFF', '--border': '#333333', '--muted': '#1C1C1C', '--muted-foreground': '#AAAAAA', '--foreground': '#FFFFFF', '--ring': '#FFFFFF', '--sidebar': '#000000' },
                    'neon-sign':            { '--background': '#000000', '--card': '#080808', '--primary': '#00FF41', '--border': '#1A3A1A', '--muted': '#0D1A0D', '--muted-foreground': '#55AA55', '--foreground': '#CCFFCC', '--ring': '#00FF41', '--sidebar': '#000000' },
                    'high-voltage':         { '--background': '#0A0A0A', '--card': '#141414', '--primary': '#FFE800', '--border': '#3A3A00', '--muted': '#1F1F00', '--muted-foreground': '#AAAA00', '--foreground': '#FFFBE0', '--ring': '#FFE800', '--sidebar': '#050505' },
                    'blueprint':            { '--background': '#0B1426', '--card': '#142040', '--primary': '#5BC8FF', '--border': '#2A4070', '--muted': '#1A2D50', '--muted-foreground': '#7AAABB', '--foreground': '#E8F4FF', '--ring': '#5BC8FF', '--sidebar': '#081020' },
                    'paper':                { '--background': '#F7F2E8', '--card': '#FFFFFF', '--primary': '#1A0800', '--border': '#C8B8A8', '--muted': '#EDE8DC', '--muted-foreground': '#6B5040', '--foreground': '#1A0800', '--ring': '#1A0800', '--sidebar': '#EDE8DC' },
                    'wcag-dark':            { '--background': '#1A1A1A', '--card': '#252525', '--primary': '#FFE000', '--border': '#444444', '--muted': '#303030', '--muted-foreground': '#BBBBBB', '--foreground': '#FFFFFF', '--ring': '#FFE000', '--sidebar': '#111111' },
                    'signal':               { '--background': '#0A0000', '--card': '#150000', '--primary': '#FF2020', '--border': '#3A0000', '--muted': '#220000', '--muted-foreground': '#AA5555', '--foreground': '#FFE8E8', '--ring': '#FF2020', '--sidebar': '#050000' },
                };
                const name = localStorage.getItem('grc-theme') || 'forest-grc';
                const vars = THEMES[name] || THEMES['forest-grc'];
                const root = document.documentElement;
                for (const [k, v] of Object.entries(vars)) {
                    root.style.setProperty(k, v);
                }
                root.setAttribute('data-theme', name);
                // Set fallback bg immediately so there's no flash
                document.documentElement.style.backgroundColor = vars['--background'] || '#091413';
            })();
        </script>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
