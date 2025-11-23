import { refreshAccessToken } from './auth';

export async function getBusyTimes(
    refreshToken: string,
    startTime: string,
    endTime: string,
    config: { clientId: string; clientSecret: string }
) {
  try {
    // 1. Get a fresh access token
    const tokenData = await refreshAccessToken(refreshToken, config);
    const accessToken = tokenData.access_token;

    // 2. Query FreeBusy
    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: 'primary' }]
      })
    });

    if (!response.ok) {
        console.error('FreeBusy Error:', await response.text());
        return [];
    }

    const data = await response.json();
    const busy = data.calendars?.primary?.busy || [];

    return busy.map((slot: any) => ({
      start: new Date(slot.start),
      end: new Date(slot.end)
    }));

  } catch (error) {
    console.error('Error fetching free/busy:', error);
    return [];
  }
}
