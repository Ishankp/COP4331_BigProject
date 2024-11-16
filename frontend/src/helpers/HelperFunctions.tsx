import app_name from "./Consts";

function buildPath(route: string): string {
    return process.env.NODE_ENV !== 'development'
        ? 'http://' + app_name + ':5000/' + route
        : 'http://localhost:5000/' + route;
}


export default buildPath;