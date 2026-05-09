'use client';
import { useForm } from 'react-hook-form';
export function LoginForm(){const {register,handleSubmit}=useForm<any>(); return <form onSubmit={handleSubmit(async(v)=>{await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(v)}); location.href='/quotes';})}><input placeholder='email' {...register('email')}/><input type='password' placeholder='password' {...register('password')}/><button>Login</button></form>}
