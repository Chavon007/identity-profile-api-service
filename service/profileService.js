import axios from "axios";

export const getProfile = async (name) => {
  const ageRes = await axios.get(`https://api.agify.io/?name=${name}`);
  const genderRes = await axios.get(`https://api.genderize.io/?name=${name}`);
  const countryRes = await axios.get(
    `https://api.nationalize.io/?name=${name}`
  );

  return {
    age: ageRes.data.age,
    gender: genderRes.data.gender,
    probability: genderRes.data.probability,
    count: genderRes.data.count,
    country: countryRes.data.country,
  };
};