import "./css/ExplorePage.css";
import ExploreCard from "./ExploreCard";
import SmallSideBar from "./SmallSideBar";

export default function explorePage() {
  const user = {
    username: "Peter Thiel",
    profilePicture:
      "https://unsplash.com/photos/a-small-bird-perched-on-top-of-a-persons-hand-9yYpMvn-j30",
    title: "TThis is PayPal we found a way to bring cash in to emails ",
    postDescription:
      "Pay pal is a platfeom where you can easily exchange money via just emails super innovative rigth? I know.",
    category: "Web Design",
    post: "https://unsplash.com/photos/a-small-bird-perched-on-top-of-a-persons-hand-9yYpMvn-j30",
    emojis: ["👍", "❤️", "😄"],
  };

  return (
    <div className="explore-container">
      <SmallSideBar />
      <div className="outer-container">
        <header>
          <h1 className="first-header">Explore</h1>
        </header>

        <div className="search">
          <input type="text" placeholder="Search" id="search-input" />
        </div>
        <div className="categories">
          <span>All</span>
          <span>Web design</span>
          <span>YouTube</span>
          <span>Writting</span>
          <span>AI/ML</span>
        </div>
        <main>
          <div className="feed">
            <ExploreCard
              username={user.username}
              description={user.postDescription}
              category={user.category}
              title={user.title}
              post={user.post}
              profilePicture={user.profilePicture}
              emojis={user.emojis}
            />
            <ExploreCard
              username={user.username}
              description={user.postDescription}
              category={user.category}
              title={user.title}
              post={user.post}
              profilePicture={user.profilePicture}
              emojis={user.emojis}
            />
            <ExploreCard
              username={user.username}
              description={user.postDescription}
              category={user.category}
              title={user.title}
              post={user.post}
              profilePicture={user.profilePicture}
              emojis={user.emojis}
            />
          </div>
          <div className="feed">
            <ExploreCard
              username={user.username}
              description={user.postDescription}
              category={user.category}
              title={user.title}
              post={user.post}
              profilePicture={user.profilePicture}
              emojis={user.emojis}
            />
            <ExploreCard
              username={user.username}
              description={user.postDescription}
              category={user.category}
              title={user.title}
              post={user.post}
              profilePicture={user.profilePicture}
              emojis={user.emojis}
            />
            <ExploreCard
              username={user.username}
              description={user.postDescription}
              category={user.category}
              title={user.title}
              post={user.post}
              profilePicture={user.profilePicture}
              emojis={user.emojis}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
