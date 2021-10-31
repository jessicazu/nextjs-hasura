import { VFC } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client'
import { GET_USERS } from '../queries/queries'
import { GetUsersQuery } from '../types/generated/graphql'
import { Layout } from '../components/Layout'

const FetchMain: VFC = () => {
  const { data, error } = useQuery<GetUsersQuery>(GET_USERS, {
    // fetchPolicy: 'network-only', // 毎回通信する、cacheするけどここでは使わない
    fetchPolicy: 'cache-and-network', // 毎回通信する、cacheして、通信終わるまで使う ☆
    // fetchPolicy: 'cache-first', // cacheがすでにあれば通信しない、cacheする
    // fetchPolicy: 'no-cache', // 毎回通信する、cacheしない(axiosと同じ)
  })

  if (error) {
    return (
      <Layout title='Hasura fetchPolicy'>
        <p>Error: {error.message}</p>
      </Layout>
    )
  }

  return (
    <Layout title='Hasura fetchPolicy'>
      <p className='mb-6 font-bold'>Hasura main page</p>
      {console.log(data)}
      {data?.users.map((user) => (
        <p className='my-1' key={user.id}>
          {user.name}
        </p>
      ))}
      <Link href='/hasura-sub'>
        <a className='mt-6'>Next</a>
      </Link>
    </Layout>
  )
}

export default FetchMain
