import { useGetUsersQuery } from "../redux/usersApi";
import { User } from "../redux/usersApi";

export const useUserByEmail = (email: string): User | null => {
   const { data } = useGetUsersQuery(undefined);

   const users = Array.isArray(data) ? data : [];
   const user = users.find((user) => user.email === email);
   return user ?? null;
};