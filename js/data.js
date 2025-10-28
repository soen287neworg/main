export async function loadRooms() {
  const res = await fetch('./data/rooms.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load rooms.json');
  return res.json();
}
