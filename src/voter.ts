import {
    NearBindgen,
    near,
    call,
    view,
    assert,
    Vector,
    UnorderedMap,
    bytes
} from 'near-sdk-js'

class University {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

class Faculty {
    name: string;
    universityKey: string;

    constructor(name: string, universityKey: string) {
        this.name = name;
        this.universityKey = universityKey;
    }
}

class Department {
    name: string;
    facultyKey: string;

    constructor(name: string, facultyKey: string) {
        this.name = name;
        this.facultyKey = facultyKey;
    }
}

class Group {
    name: string;
    departmentKey: string;

    constructor(name: string, departmentKey: string) {
        this.name = name;
        this.departmentKey = departmentKey
    }
}

class Student {
    firstName: string;
    lastName: string;

    address: string;

    groups: string[]

    constructor(
        firstName: string,
        lastName: string,
        address: string,
        groups: string[]
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.groups = groups
    }
}

type AllowedVotersAll = {
    allowed: 'all';
};

type AllowedVotersUniversity = {
    allowed: 'university';
    universityKey: string;
};

type AllowedVotersFaculty = {
    allowed: 'faculty';
    facultyKey: string;
};

type AllowedVotersDepartment = {
    allowed: 'department';
    departmentKey: string;
};

type AllowedVotersGroup = {
    allowed: 'group';
    groupKey: string;
};

type AllowedVoters = AllowedVotersAll | AllowedVotersFaculty | AllowedVotersUniversity | AllowedVotersDepartment | AllowedVotersGroup;

class Vote {
    title: string;
    description: string;

    options: Vector<string>;

    start:bigint;
    end: bigint;

    allowedVoters: AllowedVoters;
    
    creator: string

    constructor(title: string, description: string, options: Vector<string>, end: bigint, allowedVoters: AllowedVoters) {
        this.title = title;
        this.description = description;
        this.options = options;
        this.start = near.blockTimestamp()
        this.end = end
        this.allowedVoters = allowedVoters
        this.creator = near.predecessorAccountId()
    }
}

@NearBindgen({})
class Voter {
    admins: Vector<string> = new Vector('admins')

    students: UnorderedMap<Student> = new UnorderedMap("users")
    studentsCounter: number = 0

    universities:UnorderedMap<University> = new UnorderedMap("universities");
    universitiesCounter: number = 0

    faculties:UnorderedMap<Faculty> = new UnorderedMap("faculties");
    facultiesCounter: number = 0

    departments:UnorderedMap<Department> = new UnorderedMap("departments");
    departmentsCounter: number = 0

    groups:UnorderedMap<Group> = new UnorderedMap("groups");
    groupsCounter: number = 0

    votes: Vector<Vote> = new Vector<Vote>('votes');

    votesAnswers: Vector<object> = new Vector<object>('votesAnswers')

    invites: UnorderedMap<string> = new UnorderedMap("invites");

    @view({})
    votesCount(): number {
        return this.votes.length
    }

    @view({})
    votesAnswersCount(): number {
        return this.votesAnswers.length
    }

    @view({})
    getVote({index}:{index:number}): Vote {
        return this.votes.get(index)
    }

    @view({})
    getVoteWinner({voteIndex}:{voteIndex:number}): number {
        const foundVote = this.votes.get(voteIndex)
        if (foundVote){
            assert(near.blockTimestamp() > foundVote.end, 'Voting is not ended')
            const answers = this.votesAnswers.get(voteIndex)
            assert(Object.keys(answers).length > 0, "No answers in this vote")

            const frequency = {};

            for (let key in answers) {
                const value = answers[key];
                if (frequency[value] === undefined) {
                    frequency[value] = 1;
                } else {
                    frequency[value]++;
                }
            }

            let maxFrequency = 0;
            let maxValues = [];

            for (let value in frequency) {
                if (frequency[value] > maxFrequency) {
                    maxFrequency = frequency[value];
                    maxValues = [value];
                } else if (frequency[value] === maxFrequency) {
                    maxValues.push(value);
                }
            }

            assert(maxValues.length === 1, `Multiple options have the same amount of votes: ${maxValues.toString()}`)

            return maxValues[0];
        }else{
            throw Error('Vote not found')
        }
    }

    @view({})
    getVoteAnswers({voteIndex}:{voteIndex:number}): object {
        return this.votesAnswers.get(voteIndex)
    }

    @view({})
    getVotes({voteIndex}:{voteIndex:number}): object {
        return this.votesAnswers.get(voteIndex)
    }

    @view({})
    isAdmin({address}:{address:string}): boolean {
        return this.admins.toArray().includes(address.toLowerCase())
    }
    
    @view({})
    isHaveRights({address}:{address:string}): boolean {
        return address === near.currentAccountId() || this.isAdmin({address: address})
    }

    @view({})
    findStudentByAddress({address}:{address:string}): { student: Student; key: string } {
        const users = this.students.toArray()
        for (const user of users){
            const key = user[0]
            const value = user[1]
            if (value.address.toLowerCase() === address.toLowerCase()){
                return {
                    key: key,
                    student: value
                }
            }
        }
        return null
    }
    
    @call({})
    createVote({title, description, options, end, allowedVoters}:{title:string,description:string, options: Vector<string>, end:bigint, allowedVoters: AllowedVoters}){
        const noHaveRights = 'You no have rights to create this vote'
        if (near.predecessorAccountId() !== near.currentAccountId() && !this.isAdmin({address: near.predecessorAccountId()})){
            if (allowedVoters.allowed === 'group'){
                const foundStudent = this.findStudentByAddress({address: near.predecessorAccountId()})
                assert(foundStudent, noHaveRights)
                if (!foundStudent.student.groups.includes(allowedVoters.groupKey)){
                   throw Error(noHaveRights)
                }
            }else{
                throw Error(noHaveRights)
            }
        }
        assert(end > near.blockTimestamp(), "The end of the vote must be in the future")
        const newVote = new Vote(title, description, options, end, allowedVoters)
        this.votes.push(newVote)
        this.votesAnswers.push({})
        return true
    }
    
    @call({})
    vote({voteIndex, voteOption}:{voteIndex:number, voteOption:number}){
        const notAllowedToVote = 'You not allowed to vote in this vote'
        const foundStudent = this.findStudentByAddress({address: near.predecessorAccountId()})
        if (foundStudent){
            const foundVote = this.votes.get(voteIndex)
            if (foundVote){
                assert(near.blockTimestamp() < foundVote.end, 'Voting os over')
                assert(near.blockTimestamp() > foundVote.start, 'Voting is not started')

                const userDepartments = []
                const userFaculties = []
                const userUniversities = []

                for (const group of foundStudent.student.groups){
                    userDepartments.push(this.groups.get(group).departmentKey)
                }

                for (const department of userDepartments){
                    userFaculties.push(this.departments.get(department).facultyKey)
                }

                for (const faculty of userFaculties){
                    userUniversities.push(this.faculties.get(faculty).universityKey)
                }

                if (foundVote.allowedVoters.allowed !== 'all'){
                    if (foundVote.allowedVoters.allowed === 'university'){
                        if (!userUniversities.includes(foundVote.allowedVoters.universityKey)){
                            throw Error(notAllowedToVote)
                        }
                    }else if (foundVote.allowedVoters.allowed === 'faculty'){
                        if (!userFaculties.includes(foundVote.allowedVoters.facultyKey)){
                            throw Error(notAllowedToVote)
                        }
                    }else if (foundVote.allowedVoters.allowed === 'department'){
                        if (!userDepartments.includes(foundVote.allowedVoters.departmentKey)){
                            throw Error(notAllowedToVote)
                        }
                    }else if (foundVote.allowedVoters.allowed === 'group'){
                        if (!foundStudent.student.groups.includes(foundVote.allowedVoters.groupKey)){
                            throw Error(notAllowedToVote)
                        }
                    }else{
                        throw Error('Allowed voters is unknown')
                    }
                }
                if (typeof foundVote.options[voteOption] == undefined) {
                    throw Error(`Option not exist`)
                }

                let answers =  this.votesAnswers.get(voteIndex)

                answers[foundStudent.key] = voteOption
                
                this.votesAnswers.replace(voteIndex, answers)

                return JSON.stringify(this.votesAnswers.toArray())

            }else{
                throw Error(`Vote with index ${voteIndex} not found`)
            }
        }else{
             throw Error(notAllowedToVote)
        }
    }

    @call({})
    createStudents({students}:{students:Student[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const addedStudents = []
            for (const student of students){
                assert(!this.findStudentByAddress({address: student.address}), `Student with address ${student.address} already exist`)
                const key = this.studentsCounter.toString()
                let groups
                if (student.groups){
                    for (const group of student.groups){
                        if (!this.groups.get(group)){
                            throw Error(`Group with key ${group} does not exist`)
                        }
                    }
                    groups = student.groups
                }else{
                    groups = []
                }
                const value = new Student(student.firstName, student.lastName, student.address.toLowerCase(), groups)
                this.students.set(key, value);
                this.studentsCounter++
                addedStudents.push({
                    key: key,
                    student: value
                })
            }
            return addedStudents
        }else{
            throw Error('No have rights to create students')
        }
    }

    @call({})
    deleteStudents({students}:{students:string[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            for (const student of students){
                this.students.remove(student)
            }
            return true
        }else{
            throw Error('No have rights to delete students')
        }
    }

    @view({})
    getStudents(): [string, Student][] {
        return this.students.toArray()
    }

    @call({})
    createUniversities({universities}:{universities:University[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const addedUniversities = []
            for (const university of universities){
                const key = this.universitiesCounter.toString()
                const value = new University(university.name)
                this.universities.set(key, value);
                this.universitiesCounter++
                addedUniversities.push({
                    key: key,
                    university: value
                })
            }
            return addedUniversities
        }else{
            throw Error('No have rights to create universities')
        }
    }

    @call({})
    deleteUniversities({universities}:{universities:string[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const facultiesToDelete = []
            const departmentsToDelete = []
            const groupsToDelete = []
            for (const university of universities){
                this.universities.remove(university)

            }
            for (const faculty of this.faculties.toArray()){
                const key = faculty[0]
                const value = faculty[1]
                if (universities.includes(value.universityKey)){
                    this.faculties.remove(key)
                    facultiesToDelete.push(key)
                }
            }

            for (const department of this.departments.toArray()){
                const key = department[0]
                const value = department[1]
                if (facultiesToDelete.includes(value.facultyKey)){
                    this.departments.remove(key)
                    departmentsToDelete.push(key)
                }
            }

            for (const group of this.groups.toArray()){
                const key = group[0]
                const value = group[1]
                if (departmentsToDelete.includes(value.departmentKey)){
                    this.groups.remove(key)
                    groupsToDelete.push(key)
                }
            }

            for (const student of this.students.toArray()){
                const key = student[0]
                const value = student[1]
                value.groups = value.groups.filter(element => !groupsToDelete.includes(element));
                this.students.set(key, value)
            }
            return true
        }else{
            throw Error('No have rights to delete universities')
        }
    }

    @call({})
    createFaculties({faculties}:{faculties:Faculty[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const addedFaculties = []

            for (const faculty of faculties){
                if (this.universities.get(faculty.universityKey)){
                    const key = this.facultiesCounter.toString()
                    const value = new Faculty(faculty.name, faculty.universityKey)
                    this.faculties.set(key, value);
                    this.facultiesCounter++
                    addedFaculties.push({
                        key: key,
                        faculty: value
                    })
                }else{
                    throw Error(`University with key ${faculty.universityKey} does not exist`)
                }
            }
            return addedFaculties
        }else{
            throw Error('No have rights to create faculties')
        }
    }

    @call({})
    deleteFaculties({faculties}:{faculties:string[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const facultiesToDelete = []
            const departmentsToDelete = []
            const groupsToDelete = []

            for (const faculty of faculties){
                this.faculties.remove(faculty)
                facultiesToDelete.push(faculty)
            }

            for (const department of this.departments.toArray()){
                const key = department[0]
                const value = department[1]
                if (facultiesToDelete.includes(value.facultyKey)){
                    this.departments.remove(key)
                    departmentsToDelete.push(key)
                }
            }

            for (const group of this.groups.toArray()){
                const key = group[0]
                const value = group[1]
                if (departmentsToDelete.includes(value.departmentKey)){
                    this.groups.remove(key)
                    groupsToDelete.push(key)
                }
            }

            for (const student of this.students.toArray()){
                const key = student[0]
                const value = student[1]
                value.groups = value.groups.filter(element => !groupsToDelete.includes(element));
                this.students.set(key, value)
            }

            return true
        }else{
            throw Error('No have rights to delete faculties')
        }
    }

    @call({})
    createDepartments({departments}:{departments:Department[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const addedDepartments = []
            for (const department of departments){
                if (this.faculties.get(department.facultyKey)){
                    const key = this.departmentsCounter.toString()
                    const value = new Department(department.name, department.facultyKey)
                    this.departments.set(key, value);
                    this.departmentsCounter++
                    addedDepartments.push({
                        key: key,
                        department: value
                    })
                }else{
                    throw Error(`Faculty with key ${department.facultyKey} does not exist`)
                }
            }
            return addedDepartments
        }else{
            throw Error('No have rights to create departments')
        }
    }

    @call({})
    deleteDepartments({departments}:{departments:string[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const departmentsToDelete = []
            const groupsToDelete = []
            for (const department of departments){
                this.departments.remove(department)
                departmentsToDelete.push(department)
            }

            for (const group of this.groups.toArray()){
                const key = group[0]
                const value = group[1]
                if (departmentsToDelete.includes(value.departmentKey)){
                    this.groups.remove(key)
                    groupsToDelete.push(key)
                }
            }

            for (const student of this.students.toArray()){
                const key = student[0]
                const value = student[1]
                value.groups = value.groups.filter(element => !groupsToDelete.includes(element));
                this.students.set(key, value)
            }

            return true
        }else{
            throw Error('No have rights to delete departments')
        }
    }

    @call({})
    createGroups({groups}:{groups:Group[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const addedGroups = []
            for (const group of groups){
                if (this.departments.get(group.departmentKey)){
                    const key = this.groupsCounter.toString()
                    const value = new Group(group.name, group.departmentKey)
                    this.groups.set(key, value);
                    this.groupsCounter++
                    addedGroups.push({
                        key: key,
                        department: value
                    })
                }else{
                    throw Error(`Department with key ${group.departmentKey} does not exist`)
                }
            }
            return addedGroups
        }else{
            throw Error('No have rights to create groups')
        }
    }

    @call({})
    deleteGroups({groups}:{groups:string[]}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            const groupsToDelete = []
            for (const group of groups){
                this.groups.remove(group)
                groupsToDelete.push(group)
            }

            for (const student of this.students.toArray()){
                const key = student[0]
                const value = student[1]
                value.groups = value.groups.filter(element => !groupsToDelete.includes(element));
                this.students.set(key, value)
            }

            return true
        }else{
            throw Error('No have rights to delete groups')
        }
    }

    @call({})
    createSingleInvite({hash, group}:{hash:string, group:string}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            if (this.groups.get(group)){
                this.invites.set(hash, group)
                return true
            }else{
                throw `Group does not exist`
            }
        }else{
            throw Error('No have rights to create invites')
        }
    }
    
    @call({})
    createMultiInvites({hashes, group}:{hashes:string[], group:string}){
        if (this.isHaveRights({address:near.predecessorAccountId()})){
            if (this.groups.get(group)){
                for (const hash of hashes){
                    this.invites.set(hash, group)
                }
                return true
            }else{
                throw `Group does not exist`
            }
        }else{
            throw Error('No have rights to create invites')
        }
    }

    @call({})
    deleteAllInvites(){
        return this.invites.clear()
    }

    @call({})
    regiter({firstName, lastName, code}:{firstName:string, lastName:string, code:string}){
        const hash = Object.values(near.sha256(bytes(code))).map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('')
        const group = this.invites.get(hash)
        if (group){
            const groupExist = this.groups.get(group)
            if (groupExist){
                const foundStudent = this.findStudentByAddress({address: near.predecessorAccountId()})
                if (!foundStudent){
                    this.invites.remove(hash)
                    this.students.set(
                        this.studentsCounter.toString(),
                        new Student(firstName, lastName, near.predecessorAccountId(), [group])
                    );
                    this.studentsCounter++
                    return true
                }else{
                    throw "Student with this address already exist"
                }
            }else{
                throw `Group does not exist`
            }
        }else{
            throw `Invite does not exist`
        }
    }
}
