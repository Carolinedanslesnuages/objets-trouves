import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import VueDsfr from '@gouvminint/vue-dsfr'
import HomeView from '../HomeView.vue'
import { violationsAccessibilite } from '@/__tests__/accessibilite'

const reponseListe = (objets: unknown[]) =>
  Promise.resolve({ ok: true, json: async () => ({ objets }) } as Response)

const monter = async (objets: unknown[]) => {
  const appel = vi.fn<() => Promise<Response>>(() => reponseListe(objets))
  vi.stubGlobal('fetch', appel)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/objets-trouves/nouveau', component: HomeView },
    ],
  })
  const wrapper = mount(HomeView, { global: { plugins: [router, VueDsfr] }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

describe('Page d’accueil : liste des objets trouvés', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('affiche un seul titre principal et demande la liste à l’API', async () => {
    const wrapper = await monter([])
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Objets trouvés')
    expect(fetch).toHaveBeenCalledWith('/api/objets-trouves')
    wrapper.unmount()
  })

  it('affiche les objets du plus récent au plus ancien, dans un tableau avec en-têtes', async () => {
    const wrapper = await monter([
      { id: 2, description: 'Portefeuille noir', lieu: 'Salle des fêtes', dateDecouverte: '2026-11-20' },
      { id: 1, description: 'Parapluie bleu', lieu: 'Hall d’accueil', dateDecouverte: '2026-11-10' },
    ])
    const entetes = wrapper.findAll('th').map((entete) => entete.text())
    expect(entetes).toEqual(['Description', 'Lieu de découverte', 'Date de découverte'])
    const cellules = wrapper.findAll('td').map((cellule) => cellule.text())
    expect(cellules).toEqual([
      'Portefeuille noir', 'Salle des fêtes', '2026-11-20',
      'Parapluie bleu', 'Hall d’accueil', '2026-11-10',
    ])
    wrapper.unmount()
  })

  it('affiche un message clair quand aucun objet n’est enregistré', async () => {
    const wrapper = await monter([])
    expect(wrapper.find('[role="status"]').text()).toContain('Aucun objet n’est enregistré')
    wrapper.unmount()
  })

  it('laisse le lien d’enregistrement accessible sans aucune étape de connexion', async () => {
    const wrapper = await monter([])
    expect(wrapper.text()).toContain('Enregistrez-le')
    expect(wrapper.find('a[href="/objets-trouves/nouveau"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique avec des objets', async () => {
    const wrapper = await monter([
      { id: 1, description: 'Parapluie bleu', lieu: 'Hall d’accueil', dateDecouverte: '2026-11-10' },
    ])
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique sans objet', async () => {
    const wrapper = await monter([])
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })
})
