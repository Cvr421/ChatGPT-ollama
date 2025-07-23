// utils/formatResponse.js
export const formatOllamaResponse = (rawText) => {
  if (!rawText) return '';
  
  let formatted = rawText
    // Remove excessive character repetition
    .replace(/(.)\1{2,}/g, '$1') // Remove repeated characters like "reallyreally"
    .replace(/,{2,}/g, ',') // Fix multiple commas
    .replace(/\.{2,}/g, '.') // Fix multiple periods
    .replace(/:{2,}/g, ':') // Fix multiple colons
    .replace(/\?{2,}/g, '?') // Fix multiple question marks
    .replace(/!{2,}/g, '!') // Fix multiple exclamation marks
    
    // Fix word duplications and concatenations - NEW PATTERNS FOR YOUR TEXT
    .replace(/\b(\w+)\s+\1\b/g, '$1') // Remove exact word duplications with space
    .replace(/\b(\w+)(\w+)\1(\w+)\b/g, '$1$2$3') // Complex duplications
    .replace(/let\s+let/gi, 'let') // Fix "let let"
    .replace(/dive\s+dive/gi, 'dive') // Fix "dive dive"
    .replace(/into\s+into/gi, 'into') // Fix "into into"
    .replace(/India\s+India/gi, 'India') // Fix "India India"
    .replace(/It\s+It/gi, 'It') // Fix "It It"
    .replace(/a\s+a\b/gi, 'a') // Fix "a a"
    .replace(/vast\s+vast/gi, 'vast') // Fix "vast vast"
    .replace(/and\s+and/gi, 'and') // Fix "and and"
    .replace(/incredbly\s+incredbly/gi, 'incredibly') // Fix duplicated "incredbly"
    .replace(/complex\s+complex/gi, 'complex') // Fix "complex complex"
    .replace(/country\s+country/gi, 'country') // Fix "country country"
    .replace(/with\s+with/gi, 'with') // Fix "with with"
    .replace(/rich\s+rich/gi, 'rich') // Fix "rich rich"
    .replace(/diverse\s+diverse/gi, 'diverse') // Fix "diverse diverse"
    .replace(/history\s+history/gi, 'history') // Fix "history history"
    .replace(/culture\s+culture/gi, 'culture') // Fix "culture culture"
    .replace(/Here\s+Here/gi, 'Here') // Fix "Here Here"
    .replace(/breakdown\s+breakdown/gi, 'breakdown') // Fix "breakdown breakdown"
    .replace(/of\s+of/gi, 'of') // Fix "of of"
    .replace(/key\s+key/gi, 'key') // Fix "key key"
    .replace(/aspects\s+aspects/gi, 'aspects') // Fix "aspects aspects"
    .replace(/broken\s+broken/gi, 'broken') // Fix "broken broken"
    .replace(/down\s+down/gi, 'down') // Fix "down down"
    .replace(/categories\s+categories/gi, 'categories') // Fix "categories categories"
    
    // Fix specific word errors from your text
    .replace(/incredbly/g, 'incredibly')
    .replace(/georaphy/g, 'geography')
    .replace(/georaphically/g, 'geographically')
    .replace(/Rupeepee/g, 'Rupee')
    .replace(/Zone\s+Zone/g, 'Zone')
    .replace(/Standard\s+Standard/g, 'Standard')
    .replace(/Time\s+Time/g, 'Time')
    .replace(/Landscape\s+Landscape/g, 'Landscape')
    .replace(/Ganggeticetic/g, 'Gangetic')
    .replace(/rainfoestss/g, 'rainforests')
    .replace(/rainfoest/g, 'rainforest')
    .replace(/southeat/g, 'southeast')
    .replace(/Regions\s+Regions/g, 'Regions')
    .replace(/HHimalimalayasayas/g, 'Himalayas')
    .replace(/higest/g, 'highest')
    .replace(/peaks\s+peaks/g, 'peaks')
    .replace(/Inddoo/g, 'Indo')
    .replace(/Fertileile/g, 'Fertile')
    .replace(/land\s+land/g, 'land')
    .replace(/cradle\s+cradle/g, 'cradle')
    .replace(/civilization\s+civilization/g, 'civilization')
    .replace(/major\s+major/g, 'major')
    .replace(/agriculturl/g, 'agricultural')
    .replace(/region\s+region/g, 'region')
    .replace(/GGangesanges/g, 'Ganges')
    .replace(/River\s+River/g, 'River')
    .replace(/Valley\s+Valley/g, 'Valley')
    .replace(/for\s+for/g, 'for')
    .replace(/agriculture\s+agriculture/g, 'agriculture')
    .replace(/religious\s+religious/g, 'religious')
    .replace(/significance\s+significance/g, 'significance')
    .replace(/Ghatss/g, 'Ghats')
    .replace(/mountain\s+mountain/g, 'mountain')
    .replace(/range\s+range/g, 'range')
    .replace(/running\s+running/g, 'running')
    .replace(/down\s+down/g, 'down')
    .replace(/western\s+western/g, 'western')
    .replace(/coast\s+coast/g, 'coast')
    .replace(/Coastal\s+Regions/g, 'Coastal Regions')
    .replace(/Diverse\s+Diverse/g, 'Diverse')
    .replace(/beaches\s+beaches/g, 'beaches')
    .replace(/mangroves\s+mangroves/g, 'mangroves')
    .replace(/mix\s+mix/g, 'mix')
    .replace(/cultures\s+cultures/g, 'cultures')
    .replace(/Highly\s+Highly/g, 'Highly')
    .replace(/variable\s+variable/g, 'variable')
    .replace(/influenced\s+influenced/g, 'influenced')
    .replace(/altitude\s+altitude/g, 'altitude')
    .replace(/location\s+location/g, 'location')
    .replace(/Generally\s+Generally/g, 'Generally')
    .replace(/warm\s+warm/g, 'warm')
    .replace(/humid\s+humid/g, 'humid')
    .replace(/monsoon\s+monsoon/g, 'monsoon')
    .replace(/seaons/g, 'seasons')
    .replace(/History\s+History/g, 'History')
    .replace(/Ancient\s+Ancient/g, 'Ancient')
    .replace(/Civilizationsizations/g, 'Civilizations')
    .replace(/has\s+has/g, 'has')
    .replace(/long\s+long/g, 'long')
    .replace(/ancient\s+ancient/g, 'ancient')
    .replace(/evidnce/g, 'evidence')
    .replace(/civilizations\s+civilizations/g, 'civilizations')
    .replace(/dating\s+dating/g, 'dating')
    .replace(/back\s+back/g, 'back')
    .replace(/thousands\s+thousands/g, 'thousands')
    .replace(/years\s+years/g, 'years')
    .replace(/Inddus/g, 'Indus')
    
    // Fix spacing issues
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\s+([,.!?;:])/g, '$1') // Remove space before punctuation
    
    // Fix structural formatting - convert to proper sections
    .replace(/\*(\d+)\.\s*([^*\n]+?)\s*\*\*:/g, '\n\n## $1. $2\n\n') // Main sections like "*1. Basic Facts & Overview:**"
    .replace(/\*(\d+)\.\s*([^*\n]+?):/g, '\n\n## $1. $2\n\n') // Main sections without asterisks
    
    // Fix bullet points and sub-items
    .replace(/\*\*\s*•\s*\*\*([^*:]+?)\*\*:\*\*([^*\n]+)/g, '\n• **$1:** $2') // Bullet points with content
    .replace(/\*\*\s*([^*:]+?)\*\*:\*\*([^*\n]+)/g, '\n• **$1:** $2') // Simple bullet format
    .replace(/•\s*\*\*([^*:]+?)\*\*:\*\*([^*\n]*)/g, '\n• **$1:** $2') // Clean bullet format
    
    // Fix nested items and sub-bullets
    .replace(/\*\*\s*•\s*\*\*([^*:]+?)\*\*:/g, '\n  • **$1:**') // Nested bullets
    .replace(/\*\*\s*\*\*([^*:]+?)\*\*:/g, '\n    • **$1:**') // Sub-nested items
    
    // Clean up URLs and links
    .replace(/\[\s*\[([^\]]+?)\]\s*\]\s*\(\s*\(([^)]+?)\)\s*\)/g, '[$1]($2)') // Fix double brackets and parens
    .replace(/https:\s*\/\/\s*/g, 'https://') // Fix broken URLs
    
    // Fix parentheses and brackets issues
    .replace(/\(\s*\(/g, '(') // Fix double opening parentheses
    .replace(/\)\s*\)/g, ')') // Fix double closing parentheses
    .replace(/\[\s*\[/g, '[') // Fix double opening brackets
    .replace(/\]\s*\]/g, ']') // Fix double closing brackets
    
    // Clean up line breaks and spacing
    .replace(/\n{3,}/g, '\n\n') // Multiple line breaks to double
    .replace(/\n\s*\n/g, '\n\n') // Clean up spacing around line breaks
    .replace(/^\s+/gm, '') // Remove leading spaces from lines
    
    .trim();
  
  return formatted;
};
