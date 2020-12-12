const key = "?client_id=Al5hgIzTVocyjuJ6L5FB6QFYwjscktFewU9n-IRYz6k";
const url = "https://api.unsplash.com/photos";

const fetchImages = async page => {

    const response = await fetch(`${url}${key}&per_page=3&page=${page}`);
    const data = await response.json();

    if (response.status >= 400) {
        throw new Error(data.errors);
    }
    return data;
}

export { fetchImages };