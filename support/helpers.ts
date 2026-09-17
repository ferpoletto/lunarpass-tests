export function formatDate(dateString: string): string {
    const months = [
        'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
        'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
    ];

    const [year, month, day] = dateString.split('-').map(Number);

    if (!year || !month || !day || month < 1 || month > 12) {
        throw new Error(`Invalid date format: "${dateString}". Expected AAAA-MM-DD.`);
    }

    const dayNumber = parseInt(String(day), 10); // removes leading zero, e.g. "05" -> 5
    const monthName = months[month - 1];

    return `${dayNumber} de ${monthName} de ${year}`;
}
