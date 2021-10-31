import { useState, useCallback, ChangeEvent, FormEvent } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_USER } from '../queries/queries'
import { CreateUserMutation } from '../types/generated/graphql'

export const useCreateForm = () => {
  const [text, setText] = useState('')
  const [username, setUsername] = useState('')

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

  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }, [])

  const usernameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }, [])

  const printMsg = useCallback(() => {
    console.log('Hello')
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      try {
        await insert_users_one({
          variables: {
            name: username,
          },
        })
      } catch (err) {
        alert(err.message)
      }
      setUsername('')
    },
    [username] // ここに依存を書かないと、usernameが毎回初期値の''になってしまう
  )

  return {
    text,
    handleSubmit,
    username,
    usernameChange,
    printMsg,
    handleTextChange,
  }
}
