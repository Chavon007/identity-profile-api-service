import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const genderize_API = "https://api.genderize.io";
const agify_API = "https://api.agify.io";
const nationalize_API = "https://api.nationalize.io";

export const getProfile = async (name) => {
  try {
    const [genderRes, ageRes, nationRes] = await Promise.all([
      axios.get(genderize_API, {
        params: { name },
      }),
      axios.get(agify_API, {
        params: { name },
      }),
      axios.get(nationalize_API, {
        params: { name },
      }),
    ]);

    return {
      gender: genderRes.data.gender,
      probability: genderRes.data.probability,
      count: genderRes.data.count,
      name: genderRes.data.name,

      age: ageRes.data.age,

      country: nationRes.data.country,
    };
  } catch (err) {
    throw err;
  }
};
