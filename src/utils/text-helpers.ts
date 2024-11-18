export const isRTL = (text: string = ""): boolean => {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF]/;
    return rtlRegex.test(text);
}

export const pluralToSingular = (word: string): string => {
    if (!!word && word.endsWith('s')) {
        return word.slice(0, -1);
    }
    return word;
}

export const capitalizeFirstLetter = (string: string): string => {
    if (typeof string !== 'string' || string.length === 0) {
        return '';
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const formatVersionString = (version: string): string => {
    return `v${version.replace(/[^0-9.]/g, '')}`;
}

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export const sanitizeClassName = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}