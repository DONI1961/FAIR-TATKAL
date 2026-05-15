import { redirect } from 'next/navigation'
import React from 'react'
import { ArrowLeft, CircleInfo } from '@gravity-ui/icons'
import { Button } from './ui/button'

const NotFound = ({ error, message, title }) => {
  const handleClick = () => {
    redirect('/search')
  }

  return (
    <div className="app-shell flex min-h-[65vh] items-center justify-center py-8">
      <div className="w-full max-w-xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-xl shadow-foreground/5 backdrop-blur">
        <div className="mx-auto flex size-18 items-center justify-center rounded-full bg-secondary text-muted-foreground border border-border">
          <CircleInfo className="size-8" />
        </div>
        <p className="mt-6 text-3xl font-black text-foreground tracking-tight">
          {title ? title : (error ? "Intelligence Error" : "Terminal Not Found")}
        </p>
        <p className="mt-4 text-base text-muted-foreground font-medium">
          {error ? message : "Sorry, the page you are looking for could not be found."}
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95"
            onClick={handleClick}
          >
            <ArrowLeft className="size-4 mr-2" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
