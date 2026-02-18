const JSON_PATH = '/mock-data.json';

function withDelay(promise, ms = 250) {
  return new Promise((res, rej) => {
    promise.then((v) => setTimeout(() => res(v), ms)).catch(rej);
  });
}

export async function fetchAll() {
  const res = await fetch(JSON_PATH);
  if (!res.ok) throw new Error('Failed to load mock data');
  return res.json();
}

export async function getPosts(delay = 150) {
  return withDelay(fetchAll().then((d) => d.posts), delay);
}

export async function getExplorePosts(delay = 150) {
  return withDelay(fetchAll().then((d) => d.explorePosts), delay);
}

export async function getRooms(delay = 120) {
  return withDelay(fetchAll().then((d) => d.rooms), delay);
}

export async function getInvites(delay = 120) {
  return withDelay(fetchAll().then((d) => d.invites), delay);
}

export default { getPosts, getExplorePosts, getRooms, getInvites };
