import { Button, Card, Form, Input, Typography } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/loginSchema'
import { tokenService } from '@/services/tokenService'

const LoginPage = () => {
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    console.log('Login data:', data)

    // Tạm thời mock token để test auth flow.
    // Khi có API thật sẽ thay đoạn này.
    tokenService.setToken('test-token')

    navigate('/', {
      replace: true,
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}
    >
      <Card
        style={{
          width: 400,
        }}
      >
        <Typography.Title level={2}>
          Đăng nhập
        </Typography.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Item
            label="Tên đăng nhập"
            validateStatus={errors.username ? 'error' : ''}
            help={errors.username?.message}
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Tên đăng nhập"
                  autoComplete="username"
                  status={errors.username ? 'error' : ''}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Mật khẩu"
                  autoComplete="current-password"
                  status={errors.password ? 'error' : ''}
                />
              )}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isSubmitting}
          >
            Đăng nhập
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage