import ButtonLink from "@/components/ui/ButtonLink"
import Logo from "@/components/ui/Logo"
import type { UIProps } from "@/utils/typedProps"
import classNames from "classnames"
import { useRouter } from "next/router"
import type { FC, ReactNode } from "react"

const FormWrapper: FC<
  UIProps<{
    children: ReactNode
    title: string
  }>
> = ({ children, title }) => {
  const { asPath } = useRouter()
  const isConnexionPage = asPath.startsWith("/connexion")

  return (
    <div
      className="bg-main flex min-h-screen w-full flex-col items-center justify-between gap-16 py-8
    px-6"
    >
      <div className="flex w-full flex-col items-center gap-10 lg:mt-[100px]">
        <div className="self-start lg:hidden">
          <Logo />
        </div>
        <h1 className="text-center text-4xl font-black sm:text-5xl">
          {title.split(" ").map((word, index) => (
            <span
              key={word}
              className={classNames({ "text-emerald-500": index === 2 })}
            >
              {word}{" "}
            </span>
          ))}
        </h1>
        {children}
      </div>
      <div className="flex flex-col items-center gap-10 text-center text-sm">
        <div className="flex flex-col items-center gap-4">
          <p>{`${
            isConnexionPage
              ? "Toujours pas sur MonMatos ?"
              : "Votre groupe est déjà inscrit ?"
          }`}</p>

          <ButtonLink
            href={isConnexionPage ? "/inscription" : "/connexion"}
            variant="black"
            size="xs"
            className="max-w-fit"
            icon="FaPen"
          >
            {isConnexionPage ? "Inscrire mon groupe" : "Me connecter"}
          </ButtonLink>
        </div>

        <a href={process.env.NEXT_PUBLIC_URL} className="underline">
          Revenir à l'accueil
        </a>
      </div>
    </div>
  )
}

export default FormWrapper
