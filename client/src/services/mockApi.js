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

export async function getPosts(page = 1, limit = 5, delay = 150) {
  return withDelay(
    fetchAll().then((d) => {
      const start = (page - 1) * limit;
      const end = start + limit;
      return d.posts.slice(start, end);
    }),
    delay
  );
}

export async function getExplorePosts(page = 1, limit = 6, delay = 150, category) {
  return withDelay(
    fetchAll().then((d) => {
      let items = d.explorePosts;
      if (category && category !== "All") {
        items = items.filter((p) => p.category === category);
      }
      const start = (page - 1) * limit;
      const end = start + limit;
      return items.slice(start, end);
    }),
    delay
  );
}

export async function getProjects(delay = 120) {
  return withDelay(fetchAll().then((d) => d.projects), delay);
}

export async function getRooms(page = 1, limit = 5, delay = 120) {
  return withDelay(
    fetchAll().then((d) => {
      const start = (page - 1) * limit;
      const end = start + limit;
      return d.rooms.slice(start, end);
    }),
    delay
  );
}

// messages store in-memory as a simple cache; initialized on first fetch
const _roomMessagesCache = {};

export async function getRoomMessages(roomId, delay = 150) {
  return withDelay(
    fetchAll().then((d) => {
      // initialize cache with mock data if available
      if (!_roomMessagesCache[roomId]) {
        const room = d.rooms.find((r) => r.id === roomId);
        _roomMessagesCache[roomId] = room?.messages
          ? [...room.messages]
          : [];
      }
      return _roomMessagesCache[roomId];
    }),
    delay
  );
}

export async function postRoomMessage(roomId, message, delay = 150) {
  return withDelay(
    Promise.resolve().then(() => {
      const msg = { ...message, id: Date.now().toString() };
      if (!_roomMessagesCache[roomId]) _roomMessagesCache[roomId] = [];
      _roomMessagesCache[roomId].push(msg);
      return msg;
    }),
    delay
  );
}

export async function getInvites(delay = 120) {
  return withDelay(fetchAll().then((d) => d.invites), delay);
}

export async function getPostById(id, delay = 120) {
  return withDelay(
    fetchAll().then((d) => d.posts.find((p) => p.id === id) || null),
    delay
  );
}

// derive list of categories from explore posts
export async function getExploreCategories(delay = 120) {
  return withDelay(
    fetchAll().then((d) => {
      const cats = Array.from(
        new Set(d.explorePosts.map((p) => p.category))
      );
      return cats;
    }),
    delay
  );
}

export default { getPosts, getExplorePosts, getProjects, getRooms, getInvites, getExploreCategories, getPostById };

