import request from 'request-json';
import pirate from 'thepiratebay';
import Movie from './movie_schema';

const fill = (movie) => {
    const { title } = movie;
    const { year } = movie;
    Movie.findOne({ title, year }, (err, found) => {
        if (!found) {
            console.log(movie.torrents);
            const newMovie = new Movie({
                title: movie.title,
                year: movie.year,
                rated: movie.mpa_rating,
                runtime: movie.runtime,
                poster: movie.large_cover_image,
                genres: movie.genres,
                plot: movie.summary,
                code: movie.imdb_code,
                rating: movie.rating,
                torrents: movie.torrents,
            });
            newMovie.save();
        }
    });
};

const yts = (req, res) => {
    const client = request.createClient('https://yts.ag/api/v2/');
    client.get('list_movies.json', (err, response, body) => {
        const max = Math.ceil(body.data.movie_count / 50);
        for (let i = 1; i < max; i += 1) {
            client.get(`list_movies.json?limit=50&page=${i}`, (error, responsebis, bodybis) => {
                bodybis.data.movies.forEach((movie) => {
                    fill(movie);
                });
            });
        }
        res.send('success');
    });
};

const tpb = async (req, res) => {
    const searchResults = await pirate.search('harry potter', {
        category: 'video',
        page: 3,
        orderBy: 'seeds',
        sortBy: 'desc',
    });
    console.log(searchResults);
};

export { yts, tpb };


// yts recupere les films sur le tracker yts qui ne sont pas encore sur notre
// base de données et les y ajoute
// il faut voir dans la partie functions/search si on ne recupere pas les infos IMDB
// qu'en front en cas de demande user