/**
 * Fetch a PDF from a server-side route and trigger a browser download.
 *
 * Usage:
 *   await downloadPdf('/reports/executive-summary', 'executive-summary-2026-04-12.pdf');
 *
 * Throws if the response is not OK — callers should catch and show a user error.
 */
export async function downloadPdf(url: string, filename: string): Promise<void> {
    const res = await fetch(url, {
        method:  'GET',
        headers: { Accept: 'application/pdf' },
    });

    if (!res.ok) throw new Error(`PDF request failed: ${res.status}`);

    const blob    = await res.blob();
    const objUrl  = URL.createObjectURL(blob);
    const anchor  = document.createElement('a');
    anchor.href     = objUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(objUrl);
    document.body.removeChild(anchor);
}
