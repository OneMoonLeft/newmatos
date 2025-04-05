// Importation des composants, hooks et utilitaires nécessaires
import { Modal } from "@/components/app/modal"
import { useGroup } from "@/components/hooks/useGroup"
import { useModalContext } from "@/components/hooks/useModalContext"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import Textarea from "@/components/ui/Textarea"
import { Tents } from "@/pages/tentes"
import { units } from "@/utils/records"
import { trpc } from "@/utils/trpc"
import { UIProps } from "@/utils/typedProps"
import { State, Unit } from "@prisma/client"
import classNames from "classnames"
import Head from "next/head"
import { FC, FormEvent, useState } from "react"
import { toast } from "react-hot-toast"
import TentInput from "./TentInput"
import { getTentsErrorMessage } from "./tentsErrorMessage"

// Définition du composant principal TentAddPanel
const TentAddPanel: FC<UIProps<{ tents: Tents }>> = ({ tents }) => {
  // Récupération des données de groupe et du contexte modal
  const { movement } = useGroup()
  const { setModal } = useModalContext()
  const trpcCtx = trpc.useContext()

  // Mutation pour créer une tente via TRPC
  const createMutation = trpc.tents.create.useMutation({
    onSuccess() {
      // Ferme le modal après un succès
      setModal({} as Modal)
    },
    onError(error) {
      // Affiche un message d'erreur en cas d'échec
      toast.error(error.message || "Une erreur inattendue s'est produite.")
    },
    onSettled() {
      // Invalide le cache pour recharger la liste des tentes
      trpcCtx.tents.getAll.invalidate()
    },
  })

  // Initialisation des états locaux pour gérer les données du formulaire
  const [blacklist, setBlacklist] = useState(
    (tents ?? []).map((tent) => tent.identifyingString) // Liste des identifiants déjà utilisés
  )
  const [identifyingString, setIdentifyingString] = useState("") // Identifiant unique de la tente
  const [state, setState] = useState<State>("NEUF") // État de la tente
  const [unit, setUnit] = useState<Unit>("GROUPE") // Unité à laquelle la tente est attribuée
  const [size, setSize] = useState(6) // Taille de la tente
  const [complete, setComplete] = useState(true) // Indique si la tente est complète
  const [integrated, setIntegrated] = useState(false) // Indique si le tapis de sol est intégré
  const [type, setType] = useState("CANADIENNE") // Type de tente
  const [comments, setComments] = useState("") // Commentaires supplémentaires

  // Fonction pour fermer le panneau
  const closePanel = () => setModal({} as Modal)

  // Fonction pour vérifier si une chaîne contient uniquement des lettres
  const isAlpha = (str: string) => /^[a-zA-Z]+$/.test(str)

  // Fonction pour gérer l'ajout d'une tente
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault() // Empêche le rechargement de la page

    if (identifyingString) {
      // Prépare la mutation pour créer une tente
      const createPromise = createMutation.mutateAsync({
        identifyingString,
        state,
        size,
        unit,
        complete,
        integrated,
        type,
        comments,
      })
      try {
        // Affiche des notifications pendant le processus
        await toast.promise(createPromise, {
          success: "Tente ajoutée",
          error: getTentsErrorMessage,
          loading: "Ajout en cours ...",
        })
      } catch (error) {
        // Les erreurs sont déjà gérées dans la mutation
      }
    }
  }

  // Rendu du composant
  return (
    <>
      {/* Titre de la page */}
      <Head>
        <title>Ajouter une tente | MonMatos</title>
      </Head>

      {/* Formulaire pour ajouter une tente */}
      <form
        className="mx-auto max-w-[450px] space-y-6 py-4"
        onSubmit={handleAdd}
      >
        {/* Zone d'entrée pour l'identifiant de la tente */}
        <div
          className={classNames(
            "mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4",
            {
              "border-slate-800 text-slate-800": !identifyingString, // Style par défaut
              "border-emerald-500/90 text-emerald-500/90":
                identifyingString && !blacklist.includes(identifyingString), // Style si l'identifiant est valide
              "border-red-500/90 text-red-500/90":
                identifyingString && blacklist.includes(identifyingString), // Style si l'identifiant est déjà pris
            },
          )}
        >
          <input
            type="text"
            autoFocus
            className="w-[90px] rounded-lg border-2 border-dashed bg-transparent p-1 px-2 text-center text-3xl font-bold uppercase outline-none"
            placeholder={"XX"} // Placeholder pour l'identifiant
            onChange={(e) => {
              const value = e.target.value.toUpperCase() // Convertit en majuscules
              setIdentifyingString(value)

              // Met à jour la liste noire si l'entrée est alphabétique
              if (isAlpha(value)) {
                setBlacklist((prev) => [
                  ...prev.filter((item) => !isAlpha(item)),
                  value,
                ])
              }
            }}
            value={identifyingString} // Valeur actuelle de l'identifiant
          />
        </div>

        {/* Message d'information sur l'identifiant */}
        <div className="pt-4">
          <div
            className={classNames(
              "mx-auto flex w-fit items-center space-x-2 rounded-lg py-1 px-2 text-sm font-medium sm:text-base",
              {
                "bg-amber-100 text-amber-800": !identifyingString, // Message par défaut
                "bg-green-100 text-green-800":
                  identifyingString && !blacklist.includes(identifyingString), // Message si valide
                "bg-red-100 text-red-800":
                  identifyingString && blacklist.includes(identifyingString), // Message si déjà pris
              },
            )}
          >
            <Icon name="MdOutlineErrorOutline" className="text-xl" />
            <span>Choisissez un identifiant de tente non attribué</span>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div>
          <p className="text-lg font-bold">Informations</p>
          <p>Cliquez sur les éléments afin de les modifier</p>
        </div>

        {/* Champs pour les détails de la tente */}
        <div className="space-y-2">
          {/* Champ pour l'unité */}
          <TentInput
            label="Attribué aux"
            value={unit}
            setValue={(value) => setUnit(value as Unit)}
            options={Object.entries(units[movement]).map(([key, value]) => [
              key as Unit,
              value,
            ])}
          />

          {/* Champ pour la taille */}
          <TentInput
            label="Taille"
            value={size.toString()}
            setValue={(value) => setSize(parseInt(value as string))}
            options={[
              ["0", "N'acceuille pas de personne"],
              ["1", "1 place"],
              ["2", "2 places"],
              ["3", "3 places"],
              ["4", "4 places"],
              ["5", "5 places"],
              ["6", "6 places"],
              ["8", "8 places"],
            ]}
          />

          {/* Champ pour l'état */}
          <TentInput
            label="ÉTAT"
            value={state}
            setValue={(value) => setState(value as State)}
            options={Object.entries(State).map(([key, value]) => [
              key as State,
              value,
            ])}
          />

          {/* Champ pour indiquer si la tente est complète */}
          <TentInput
            label="Complète ?"
            value={complete ? "OUI" : "NON"}
            setValue={(value) => setComplete(value === "OUI")}
            options={[
              ["OUI", "OUI"],
              ["NON", "NON"],
            ]}
          />

          {/* Champ pour le type de tente */}
          <TentInput
            label="TYPE"
            value={type}
            setValue={(value) => setType(value)}
            options={[
              ["CANADIENNE", "CANADIENNE"],
              ["QUECHUA", "QUECHUA"],
              ["MARABOUT", "MARABOUT"],
            ]}
          />

          {/* Champ pour le tapis de sol */}
          <TentInput
            label="Tapis de sol"
            value={integrated ? "INTÉGRÉ" : "NORMAL"}
            setValue={(value) => setIntegrated(value === "INTÉGRÉ")}
            options={[
              ["INTÉGRÉ", "INTÉGRÉ"],
              ["NORMAL", "NORMAL"],
            ]}
          />
        </div>

        {/* Champ pour les commentaires */}
        <Textarea
          label="Commentaires"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />

        {/* Boutons pour soumettre ou annuler */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          <Button
            type="button"
            onClick={closePanel}
            size="sm"
            icon="HiArrowLeft"
            variant="white"
            className="max-w-fit"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={
              !identifyingString ||
              blacklist.includes(identifyingString) ||
              createMutation.isLoading
            }
            size="sm"
            icon="RiSave2Fill"
            className="max-w-fit"
          >
            {createMutation.isLoading ? "Ajout ..." : "Ajouter"}
          </Button>
        </div>
      </form>
    </>
  )
}

export default TentAddPanel
