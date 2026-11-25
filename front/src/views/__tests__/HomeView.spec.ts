import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../HomeView.vue'
import { violationsAccessibilite } from '@/__tests__/accessibilite'

const monter = () => {
  const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/', component: HomeView },
      { path: '/objets-trouves/nouveau', component: HomeView },
    ],
  })
  return mount(HomeView, { global: { plugins: [router] }, attachTo: document.body })
}

describe('Page d’accueil', () => {
  it('affiche le nom du projet', () => {
    const wrapper = monter()
    expect(wrapper.find('h1').text()).toBe('Objets trouvés')
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique', async () => {
    const wrapper = monter()
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })
})
