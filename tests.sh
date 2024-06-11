# Коміляція контракту в WASM
echo "Compiling the contract..."
npm run build

# Видалення акаунту, якщо він існує
echo "-------------------------"
echo "Deleting exiting contract from blockchain....\n"

near delete votertestuni.testnet kpistudent.testnet --force

echo "-------------------------"
echo "Creating account....\n"
# Створення акаунту, і отримуємо тестові токени
near create-account votertestuni.testnet --useFaucet

echo "-------------------------"
echo "Deploying contract to blockchain....\n"
# Розгортання контракту в блокчейні за створеним раніше акаунтом
near deploy votertestuni.testnet build/voter.wasm


echo "-------------------------"
echo "Creating universities....\n"
# Створення університетів
near call votertestuni.testnet create_universities '{"universities":[{"name": "KPI"}]}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_universities '{"universities":[{"name": "KNU"}]}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Creating faculties....\n"
# Створення факультетів
near call votertestuni.testnet create_faculties '{"faculties":[{"name": "FICT", "universityKey": "0"}]}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_faculties '{"faculties":[{"name": "INFORMA", "universityKey": "1"}]}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Creating departments....\n"
# Створення кафедр
near call votertestuni.testnet create_departments '{"departments":[{"name": "AUTS", "facultyKey": "0"}]}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_departments '{"departments":[{"name": "KIBERBEZ", "facultyKey": "1"}]}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Creating groups...."
# Створення груп
near call votertestuni.testnet create_groups '{"groups":[{"name": "ІА-03", "departmentKey": "0"}]}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_groups '{"groups":[{"name": "KB-01", "departmentKey": "1"}]}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Creating students....\n"
# Створення студентів
near call votertestuni.testnet create_students '{"students": [{"firstName": "kStudent1", "lastName": "kFam1", "address": "kpi111.testnet", "groups":["0"]}]}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_students '{"students": [{"firstName": "kStudent2", "lastName": "kFam2", "address": "kpi222.testnet", "groups":["0"]}]}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_students '{"students": [{"firstName": "kStudent2", "lastName": "kFam3", "address": "kpi333.testnet", "groups":["0"]}]}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_students '{"students": [{"firstName": "shStudent1", "lastName": "sFam1", "address": "sheva111.testnet", "groups":["1"]}]}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_students '{"students": [{"firstName": "shStudent2", "lastName": "sFam2", "address": "sheva222.testnet", "groups":["1"]}]}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Creating votes....\n"
# Створення голосувань
near call votertestuni.testnet create_vote '{"title": "Тестове голосуваня", "description": "Опис голосуваня", "options": ["Так", "Ні", "Утримуюсь"], "end": "1718120231000000000", "allowedVoters": {"allowed": "all"}}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet create_vote '{"title": "Тестове голосуваня 2", "description": "Опис голосуваня 2", "options": ["Так", "Ні", "Утримуюсь"], "end": "1718120231000000000", "allowedVoters": {"allowed": "group", "groupKey": "1"}}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Getting vote by key....\n"
# Отримання голосування по ключу
near call votertestuni.testnet get_vote '{"voteIndex":0}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Voting....\n"
# Проведення голосувань
near call votertestuni.testnet vote '{"voteIndex": "0", "voteOption":0}' --accountId kpi111.testnet
echo  "\n"
near call votertestuni.testnet vote '{"voteIndex": "0", "voteOption":1}' --accountId kpi222.testnet
echo  "\n"
near call votertestuni.testnet vote '{"voteIndex": "0", "voteOption":1}' --accountId kpi333.testnet
echo  "\n"
near call votertestuni.testnet vote '{"voteIndex": "1", "voteOption":1}' --accountId sheva111.testnet
echo  "\n"
near call votertestuni.testnet vote '{"voteIndex": "1", "voteOption":0}' --accountId sheva111.testnet


echo "-------------------------"
echo "Getting vote votes....\n"
# Отримання голосів голосувань
near call votertestuni.testnet get_vote_answers '{"voteIndex": 0}' --accountId votertestuni.testnet
echo  "\n"
near call votertestuni.testnet get_vote_answers '{"voteIndex": 1}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Creating single invite....\n"
# Створення одного інвайту
#{
#  invite: '93b5feeb-7b75-4eca-a823-c2f2f011cba8',
#  hash: 'd23e399c645609468eaabaa650ceb62bede29da8f6a33b4c7fa1d1e3206c3dc1'
#}

near call votertestuni.testnet create_single_invite '{"hash":"d23e399c645609468eaabaa650ceb62bede29da8f6a33b4c7fa1d1e3206c3dc1", "group": "0"}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Сreating multiple invites....\n"
# Створення декількох інвайтів одразу
#{
#  invite: '8a19d6f6-abea-42e5-baf3-a7f56cab6813',
#  hash: 'f036676f1053cb0341c10597f86ff2b29243f2916462f53538527a8fa4f553ff'
#}
#{
#  invite: '5af68152-a7b1-4aeb-bbc9-cf31532c3f87',
#  hash: 'c794969e7b3417b3b5ce1f63bed5185b12b911774b04830a64cec00ea9fc7759'
#}

near call votertestuni.testnet create_multi_invites '{"hashes":["f036676f1053cb0341c10597f86ff2b29243f2916462f53538527a8fa4f553ff", "c794969e7b3417b3b5ce1f63bed5185b12b911774b04830a64cec00ea9fc7759"], "group": "0"}' --accountId votertestuni.testnet


echo "-------------------------"
echo "Creating Student accounts....\n"
# Створення акаунтів студентів

near create-account invitestudent111.testnet --useFaucet
echo  "\n"
near create-account invitestudent222.testnet --useFaucet


echo "-------------------------"
echo "Student registration....\n"
# Реєстрація студентів
near call votertestuni.testnet regiter '{"firstName": "fName1", "lastName": "lName1", "code": "93b5feeb-7b75-4eca-a823-c2f2f011cba8"}' --accountId invitestudent111.testnet
echo  "\n"
near call votertestuni.testnet regiter '{"firstName": "fName2", "lastName": "lName2", "code": "8a19d6f6-abea-42e5-baf3-a7f56cab6813"}' --accountId invitestudent222.testnet
