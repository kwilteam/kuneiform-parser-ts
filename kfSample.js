const kf = `database mydb;

table posts {
    id int primary notnull,
    name text notnull,
    post_title text notnull,
    post_body text notnull
}

action add_post ($id, $user, $title, $body) public {
    INSERT INTO posts VALUES ( $id , $user , $title , $body );
}

action update_post ($body, $id) public {
    UPDATE posts SET post_body = $body WHERE id = $id;
}

action delete_post ($id) public {
    DELETE FROM posts WHERE id = $id;
}`

module.exports = kf;