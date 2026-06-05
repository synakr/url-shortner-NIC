export const login = async ({ identifier, password }) => {
  if (
    identifier === "user" &&
    password === "ab12"
  ) {
    return true;
  }

  throw new Error("Invalid credentials");
};