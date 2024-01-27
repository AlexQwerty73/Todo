import { useGetUsersQuery } from "../redux/usersApi";

export const useUserByEmail = (email) => {
   const { data: users } = useGetUsersQuery();

   const user = users?.find((user) => user.email === email);
   return user ? user : null;
};