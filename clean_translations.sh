#!/bin/bash
for file in book-appointment.html chat.html track-repair.html troubleshoot.html; do
    # Remove translation-related JavaScript
    sed -i '' '/translation system/,$ {
        /translation system/d
        /TranslationManager/d
        /languageToggle/d
        /toggleLanguage/d
        /updateLanguageUI/d
        /mobileLangText/d
        /currentLang/d
        /flag/d
        /isEnglish/d
        /English.*Français/d
        /🇬🇧.*🇫🇷/d
        /const flags/d
        /flags.forEach/d
        /Handle language toggle/d
    }'
    
    # Clean up broken JavaScript at the end
    sed -i '' '/Initialize translation system/,$ {
        /^[[:space:]]*$/d
        /^[[:space:]]*\/\//d
    }'
    
    # Add proper closing
    echo "</body>" >> "$file"
    echo "</html>" >> "$file"
done
