CREATE TABLE IF NOT EXISTS Userpassword(
    password_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    created_at timestamp DEFAULT current_timestamp,
    updated_at timestamp DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS Users(
    user_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_id int REFERENCES Userpassword(password_id)
);

CREATE TABLE IF NOT EXISTS Posts(
    post_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id int REFERENCES Users(user_id),
    title text NOT NULL,
    post_description text NOT NULL,
    created_at timestamp DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS Categories(
    category_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(25) NOT NULL UNIQUE,
    post_id int REFERENCES Posts(post_id)

);

CREATE TABLE IF NOT EXISTS feedbackRoom(
    room_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp DEFAULT current_timestamp,
    room_name VARCHAR(30),
    room_description VARCHAR(255),
    room_photo_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS RoomMembers(
    member_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id int REFERENCES Users(user_id),
    room_id_id int REFERENCES feedbackRoom(room_id),
    joined_at timestamp DEFAULT current_timestamp,
    role VARCHAR(20) DEFAULT 'member',
    UNIQUE(user_id, room_id_id)
);

CREATE TABLE IF NOT EXISTS Likes(
    like_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id int REFERENCES Users(user_id),
    post_id int REFERENCES Posts(post_id)
);

CREATE TABLE IF NOT EXISTS Invites(
    invite_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inviter int REFERENCES Users(user_id),
    invited int REFERENCES Users(user_id),  -- assuming invited is a user
    room_id int REFERENCES feedbackRoom(room_id)
);
