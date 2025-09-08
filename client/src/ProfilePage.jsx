import SideBar from "./SideBar";
import "./css/ProfilePage.css";
import CardTemplate from "./CardTemplate";
import more from "./assets/icons/more.png";

export default function ProfilePage() {
  return (
    <div className="outer-container">
      <SideBar />
      <div className="user-profile-container">
        <div className="profile-header">
          <div className="profile-img">
            <img
              className="profile-picture"
              src="https://unsplash.com/photos/a-small-bird-perched-on-top-of-a-persons-hand-9yYpMvn-j30"
              alt="Profile"
            />
          </div>
          <div className="profile-info">
            <div className="profile-edit">
              <span className="username">david.n.phillipus</span>
              <button className="edit-profile">Edit profile</button>
              <img
                className="more-icon"
                src={more}
                alt="More options"
                width={24}
                height={24}
              />
            </div>
            <div className="profile-stats">
              <span className="posts-count">Posts: 10</span>
              <span className="categories">100 categories</span>
            </div>
            <h3 className="full-name">David Phillipus</h3>
            <p className="bio">
              This is just a bio nothing more nothing less but it can be
              anything you want
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
