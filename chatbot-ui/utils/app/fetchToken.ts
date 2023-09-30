const fetchToken= async () => {
    try {
        const res = await fetch('/api/External/Token');
        const json = await res.json();
        return json.accessToken;
    } catch (error) {
        console.log(error)
        return null;
    }
}

export default fetchToken;