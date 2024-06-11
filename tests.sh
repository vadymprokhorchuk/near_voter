# Коміляція контракту в WASM
npm run build

# Видалення акаунту, якщо він існує
near delete nearvoter.testnet kpistudent.testnet --force

# Створення акаунту, і отримуємо тестові токени
near create-account nearvoter.testnet --useFaucet

# Розгортання контракту в блокчейні за створеним раніше акаунтом
near deploy nearvoter.testnet build/voter.wasm


# Створення університетів
near call nearvoter.testnet createUniversities '{"universities":[{"name": "KPI"}]}' --accountId nearvoter.testnet

near call nearvoter.testnet createUniversities '{"universities":[{"name": "KNU"}]}' --accountId nearvoter.testnet


# Створення факультетів
near call nearvoter.testnet createFaculties '{"faculties":[{"name": "FICT", "universityKey": "0"}]}' --accountId nearvoter.testnet

near call nearvoter.testnet createFaculties '{"faculties":[{"name": "INFORMA", "universityKey": "1"}]}' --accountId nearvoter.testnet


# Створення кафедр
near call nearvoter.testnet createDepartments '{"departments":[{"name": "AUTS", "facultyKey": "0"}]}' --accountId nearvoter.testnet

near call nearvoter.testnet createDepartments '{"departments":[{"name": "KIBERBEZ", "facultyKey": "1"}]}' --accountId nearvoter.testnet


# Створення груп
near call nearvoter.testnet createGroups '{"groups":[{"name": "ІА-03", "departmentKey": "0"}]}' --accountId nearvoter.testnet

near call nearvoter.testnet createGroups '{"groups":[{"name": "KB-01", "departmentKey": "1"}]}' --accountId nearvoter.testnet


# Створення студентів
near call nearvoter.testnet createStudents '{"students": [{"firstName": "kStudent1", "lastName": "kFam1", "address": "kpi111.testnet", "groups":["0"]}]}' --accountId nearvoter.testnet

near call nearvoter.testnet createStudents '{"students": [{"firstName": "kStudent2", "lastName": "kFam2", "address": "kpi222.testnet", "groups":["0"]}]}' --accountId nearvoter.testnet

near call nearvoter.testnet createStudents '{"students": [{"firstName": "shStudent1", "lastName": "sFam1", "address": "sheva111.testnet", "groups":["1"]}]}' --accountId nearvoter.testnet

near call nearvoter.testnet createStudents '{"students": [{"firstName": "shStudent2", "lastName": "sFam2", "address": "sheva222.testnet", "groups":["1"]}]}' --accountId nearvoter.testnet


# Створення голосувань
near call nearvoter.testnet createVote '{"title": "Тестове голосуваня", "description": "Опис голосуваня", "options": ["Так", "Ні", "Утримуюсь"], "end": "1719033391154000000", "allowedVoters": {"allowed": "all"}}' --accountId nearvoter.testnet

near call nearvoter.testnet createVote '{"title": "Тестове голосуваня 2", "description": "Опис голосуваня 2", "options": ["Так", "Ні", "Утримуюсь"], "end": "1719033391154000000", "allowedVoters": {"allowed": "group", "groupKey": "1"}}' --accountId nearvoter.testnet


# Створення тримання голосування по ключу
near call nearvoter.testnet getVote '{"index":0}' --accountId nearvoter.testnet


# Проведення голосувань
near call nearvoter.testnet vote '{"voteIndex": "0", "voteOption":0}' --accountId kpi111.testnet

near call nearvoter.testnet vote '{"voteIndex": "0", "voteOption":1}' --accountId kpi222.testnet

near call nearvoter.testnet vote '{"voteIndex": "1", "voteOption":1}' --accountId sheva111.testnet

near call nearvoter.testnet vote '{"voteIndex": "1", "voteOption":0}' --accountId sheva111.testnet


# Отримання голосів голосувань
near call nearvoter.testnet getVoteAnswers '{"voteIndex": 0}' --accountId nearvoter.testnet

near call nearvoter.testnet getVoteAnswers '{"voteIndex": 1}' --accountId nearvoter.testnet


# Створення одного інвайту
#{
#  invite: '93b5feeb-7b75-4eca-a823-c2f2f011cba8',
#  hash: 'd23e399c645609468eaabaa650ceb62bede29da8f6a33b4c7fa1d1e3206c3dc1'
#}

near call nearvoter.testnet createSingleInvite '{"hash":"d23e399c645609468eaabaa650ceb62bede29da8f6a33b4c7fa1d1e3206c3dc1", "group": "0"}' --accountId nearvoter.testnet


# Створення декількох інвайтів одразу
#{
#  invite: '8a19d6f6-abea-42e5-baf3-a7f56cab6813',
#  hash: 'f036676f1053cb0341c10597f86ff2b29243f2916462f53538527a8fa4f553ff'
#}
#{
#  invite: '5af68152-a7b1-4aeb-bbc9-cf31532c3f87',
#  hash: 'c794969e7b3417b3b5ce1f63bed5185b12b911774b04830a64cec00ea9fc7759'
#}

near call nearvoter.testnet createMultiInvites '{"hashes":["f036676f1053cb0341c10597f86ff2b29243f2916462f53538527a8fa4f553ff", "c794969e7b3417b3b5ce1f63bed5185b12b911774b04830a64cec00ea9fc7759"], "group": "0"}' --accountId nearvoter.testnet


# Видалення акаунтів студентів, якщо вони існують
near delete invitestudent1.testnet nearvoter.testnet --force

near delete invitestudent2.testnet nearvoter.testnet --force

near delete invitestudent3.testnet nearvoter.testnet --force


# Створення акаунтів студентів

near create-account invitestudent1.testnet --useFaucet

near create-account invitestudent2.testnet --useFaucet

near create-account invitestudent3.testnet --useFaucet


# Реєстрація студентів
near call nearvoter.testnet regiter '{"firstName": "fName1", "lastName": "lName1", "code": "93b5feeb-7b75-4eca-a823-c2f2f011cba8"}' --accountId invitestudent1.testnet

near call nearvoter.testnet regiter '{"firstName": "fName2", "lastName": "lName2", "code": "8a19d6f6-abea-42e5-baf3-a7f56cab6813"}' --accountId invitestudent3.testnet
