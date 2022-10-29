import axios from 'axios';

export default axios.create({
  baseURL: 'https://dapps-server.vefinetwork.org/api'
});
