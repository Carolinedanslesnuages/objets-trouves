import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import VueDsfr from '@gouvminint/vue-dsfr'
import EnregistrerObjetView from '../EnregistrerObjetView.vue'
import { dateDuJour } from '@/services/objetsTrouvesValidation'
import { violationsAccessibilite } from '@/__tests__/accessibilite'

const monter = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: EnregistrerObjetView }],
  })
  return mount(EnregistrerObjetView, { global: { plugins: [router, VueDsfr] }, attachTo: document.body })
}

async function remplir(wrapper: VueWrapper, valeurs: { description?: string; lieu?: string; date?: string }) {
  if (valeurs.description !== undefined) await wrapper.find('textarea').setValue(valeurs.description)
  if (valeurs.lieu !== undefined) await wrapper.find('input[type="text"], input:not([type])').setValue(valeurs.lieu)
  if (valeurs.date !== undefined) await wrapper.find('input[type="date"]').setValue(valeurs.date)
}

async function envoyer(wrapper: VueWrapper) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('Enregistrer un objet trouvé', () => {
  let appelsApi: ReturnType<typeof vi.fn<(adresse: string, options: RequestInit) => Promise<unknown>>>

  beforeEach(() => {
    appelsApi = vi.fn<(adresse: string, options: RequestInit) => Promise<unknown>>().mockResolvedValue({ ok: true, status: 201, json: async () => ({}) })
    vi.stubGlobal('fetch', appelsApi)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('affiche un seul titre principal et le formulaire à trois champs obligatoires', () => {
    const wrapper = monter()
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Enregistrer un objet trouvé')
    for (const etiquette of ['Description de l’objet', 'Lieu de découverte', 'Date de découverte']) {
      expect(wrapper.text()).toContain(etiquette)
    }
    expect(wrapper.text()).toContain('Tous les champs sont obligatoires')
    for (const champ of wrapper.findAll('textarea, input')) {
      expect(champ.attributes('required')).toBeDefined()
      expect(document.querySelector(`label[for="${champ.attributes('id')}"]`)).not.toBeNull()
    }
    expect(wrapper.find('button[type="submit"]').text()).toBe('Enregistrer l’objet')
    wrapper.unmount()
  })

  it('refuse la date de demain côté champ (attribut max = aujourd’hui)', () => {
    const wrapper = monter()
    expect(wrapper.find('input[type="date"]').attributes('max')).toBe(dateDuJour())
    wrapper.unmount()
  })

  it('signale chaque champ vide près du champ, sans rien envoyer', async () => {
    const wrapper = monter()
    await envoyer(wrapper)
    expect(wrapper.text()).toContain('Renseignez la description de l’objet.')
    expect(wrapper.text()).toContain('Renseignez le lieu de découverte.')
    expect(wrapper.text()).toContain('Renseignez la date de découverte.')
    expect(wrapper.find('[role="status"]').text()).toContain('3 erreurs')
    expect(appelsApi).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('relie le message d’erreur au champ concerné', async () => {
    const wrapper = monter()
    await envoyer(wrapper)
    const champ = wrapper.find('textarea')
    const identifiantMessage = champ.attributes('aria-describedby')
    expect(identifiantMessage).toBeTruthy()
    const messagesLies = (identifiantMessage ?? '').split(' ').map((identifiant) => document.getElementById(identifiant)?.textContent ?? '')
    expect(messagesLies.join(' ')).toContain('Renseignez la description de l’objet.')
    wrapper.unmount()
  })

  it('refuse une date dans le futur avec un message près du champ', async () => {
    const wrapper = monter()
    await remplir(wrapper, { description: 'Parapluie', lieu: 'Hall', date: '2999-01-01' })
    await envoyer(wrapper)
    expect(wrapper.text()).toContain('La date de découverte ne peut pas être dans le futur.')
    expect(appelsApi).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('accepte la date du jour', async () => {
    const wrapper = monter()
    await remplir(wrapper, { description: 'Parapluie', lieu: 'Hall', date: dateDuJour() })
    await envoyer(wrapper)
    expect(appelsApi).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('envoie la saisie, confirme l’enregistrement et vide le formulaire', async () => {
    const wrapper = monter()
    await remplir(wrapper, { description: ' Parapluie bleu ', lieu: 'Hall d’accueil', date: '2020-01-15' })
    await envoyer(wrapper)

    expect(appelsApi).toHaveBeenCalledWith(
      '/api/objets-trouves',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ description: 'Parapluie bleu', lieu: 'Hall d’accueil', dateDecouverte: '2020-01-15' }),
      }),
    )
    expect(wrapper.find('[role="status"]').text()).toContain('L’objet est bien enregistré.')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
    wrapper.unmount()
  })

  it('affiche les erreurs renvoyées par le serveur près des champs', async () => {
    appelsApi.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ erreurs: { lieu: 'Saisissez 500 caractères au plus.' } }),
    })
    const wrapper = monter()
    await remplir(wrapper, { description: 'Parapluie', lieu: 'Hall', date: '2020-01-15' })
    await envoyer(wrapper)
    expect(wrapper.text()).toContain('Saisissez 500 caractères au plus.')
    expect(wrapper.text()).not.toContain('L’objet est bien enregistré.')
    wrapper.unmount()
  })

  it('annonce une panne du serveur sans confirmer l’enregistrement', async () => {
    appelsApi.mockRejectedValue(new Error('réseau coupé'))
    const wrapper = monter()
    await remplir(wrapper, { description: 'Parapluie', lieu: 'Hall', date: '2020-01-15' })
    await envoyer(wrapper)
    expect(wrapper.find('[role="status"]').text()).toContain('n’a pas pu être enregistré')
    expect(wrapper.text()).not.toContain('L’objet est bien enregistré.')
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique, formulaire vierge', async () => {
    const wrapper = monter()
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique, avec les erreurs affichées', async () => {
    const wrapper = monter()
    await envoyer(wrapper)
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique, après confirmation', async () => {
    const wrapper = monter()
    await remplir(wrapper, { description: 'Parapluie', lieu: 'Hall', date: '2020-01-15' })
    await envoyer(wrapper)
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })
})
