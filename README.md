# Matéria para Você

Uma plataforma de aprendizado inspirada no Moodle, onde os alunos podem acessar o conteúdo do curso postado pelos professores. O projeto foca em organização, design moderno e facilidade de uso.

## 🎨 Design e Estilo

O projeto utiliza uma estética de **Glassmorphism** (efeito de vidro fosco), com elementos translúcidos e tipografia em tons de azul escuro, garantindo elegância e legibilidade sobre um fundo dinâmico.

## 🚀 Funcionalidades Principais

*   **Hub Digital:** Landing page informativa com acesso rápido ao login e avisos importantes.
*   **Painéis Diferenciados:**
    *   **Professor:** Pode criar cursos, módulos, categorias e adicionar materiais (arquivos, links). Gerencia usuários e eventos do calendário.
    *   **Aluno:** Visualiza cursos filtrados por sua turma/ano, acessa materiais e acompanha o calendário escolar.
*   **Organização de Conteúdo:** Estrutura hierárquica robusta (Curso -> Módulo -> Categoria -> Material).
*   **Calendário Acadêmico:** Visualização completa de eventos, provas e datas importantes.
*   **Links Rápidos:** Barra lateral personalizável com acesso fácil a ferramentas externas.
*   **Simulação:** Professores podem simular a visão de um aluno de determinado ano/sala para validar o conteúdo.

## 🛠️ Tecnologias Utilizadas

*   **React 19**
*   **TypeScript**
*   **Tailwind CSS**
*   **Context API** (Gerenciamento de Estado e Internacionalização)

## ⚠️ Observação sobre Dados

O sistema atualmente opera com armazenamento em memória volátil (sem LocalStorage ou Banco de Dados persistente). 
*   A validação de login é simplificada para fins de teste.
*   Recarregar a página resetará os dados criados durante a sessão.

## 📝 Créditos

© 2025 Raphael Costa. Todos os direitos reservados.
Feito para o site Matéria para Você.