import React, { VFC, useState, FormEvent } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
  GET_USERS,
  CREATE_USER,
  DELETE_USER,
  UPDATE_USER,
} from '../queries/queries'
import {
  GetUsersQuery,
  CreateUserMutation,
  DeleteUserMutation,
  UpdateUserMutation,
} from '../types/generated/graphql'
import { Layout } from '../components/Layout'
import { UserItem } from '../components/UserItem'

const HasuraCRUD: VFC = () => {
  const [editedUser, setEditedUser] = useState({ id: '', name: '' })

  const { data, error } = useQuery<GetUsersQuery>(GET_USERS, {
    fetchPolicy: 'cache-and-network',
  })
  const [update_users_by_pk] = useMutation<UpdateUserMutation>(UPDATE_USER)

  // createとdeleteは、通信後にキャッシュを更新する必要がある(updateは自動でapolloが行う)
  const [insert_users_one] = useMutation<CreateUserMutation>(CREATE_USER, {
    update(cache, { data: { insert_users_one } }) {
      // queryの結果がdata.insert_users_oneに入ってくるので取得
      const cacheId = cache.identify(insert_users_one) // __typenameとidが組み合わさったもの
      cache.modify({
        // キャッシュの更新処理
        fields: {
          users(existingUsers, { toReference }) {
            // toReferenceにcacheIdを渡すとキャッシュのデータが取れる(apollo)
            return [toReference(cacheId), ...existingUsers] // 既存のusersに追加
          },
        },
      })
    },
  })

  const [delete_users_by_pk] = useMutation<DeleteUserMutation>(DELETE_USER, {
    update(cache, { data: { delete_users_by_pk } }) {
      cache.modify({
        fields: {
          users(existingUsers, { readField }) {
            // readFieldはフィールドを絞る(apollo)
            return existingUsers.filter(
              // 今削除したuser.idとidが一致しないuserだけを残す
              (user) => delete_users_by_pk.id !== readField('id', user)
            )
          },
        },
      })
    },
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editedUser.id) {
      // editedUser.idが存在するなら編集モード
      try {
        await update_users_by_pk({
          variables: {
            id: editedUser.id,
            name: editedUser.name,
          },
        })
      } catch (err) {
        console.log(editedUser)

        alert(err.message)
      }
      setEditedUser({ id: '', name: '' })
    } else {
      // editedUser.idが存在しないなら新規作成モード
      try {
        await insert_users_one({
          variables: {
            name: editedUser.name,
          },
        })
      } catch (err) {
        alert(err.message)
      }
      setEditedUser({ id: '', name: '' })
    }
  }

  if (error) return <Layout title='Hasura CRUD'>Error: {error.message}</Layout>

  return (
    <Layout title='Hasura CRUD'>
      <p className='mb-3 font-bold'>Hasura CRUD</p>
      <form
        className='flex flex-col justify-center items-center'
        onSubmit={handleSubmit}
      >
        <input
          className='px-3 py-2 border border-gray-300'
          placeholder='New user ?'
          type='text'
          value={editedUser.name}
          onChange={(e) =>
            setEditedUser({ ...editedUser, name: e.target.value })
          }
        />
        <button
          disabled={!editedUser.name}
          className='disabled:opacity-40 my-3 py-1 px-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl focus:outline-none'
          data-testid='new'
          type='submit'
        >
          {editedUser.id ? 'Update' : 'Create'}
        </button>
      </form>

      {data?.users.map((user) => {
        return (
          <UserItem
            key={user.id}
            user={user}
            setEditedUser={setEditedUser}
            deleteUsersByPk={delete_users_by_pk}
          />
        )
      })}
    </Layout>
  )
}

export default HasuraCRUD
