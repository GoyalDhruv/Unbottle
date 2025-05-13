import { getDataFromLocalStorage, getParticipant } from '../../utils/helper';
import { IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { blockUser, unblockUser } from '../../services/authService';
import { ArrowLeft, MenuIcon } from 'lucide-react';

function ChatHeader({ users, blockedData, getChatById }) {

    const currentUser = getDataFromLocalStorage();

    const handleClick = async (action) => {
        try {
            const participantId = getParticipant(users, currentUser)?._id;

            if (action === 'Block') {
                await blockUser(participantId);
            } else if (action === 'Unblock') {
                await unblockUser(participantId);
            }

            getChatById();

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="sticky top-0 z-10 !mb-1 flex justify-between items-center">

            {/* back button */}
            <button
                onClick={() => window.history.back()}
            >
                <ArrowLeft className="!w-6 !h-6 !text-[#726fbb]" />
            </button>

            {/* username */}
            <div className="text-3xl font-bold bg-gradient-to-r from-[#6d67ff] to-[#f16186] bg-clip-text text-transparent text-center flex-1">
                {getParticipant(users, currentUser)?.username}
            </div>

            {/* menu button */}
            {(blockedData?.blockedBy === currentUser._id || !blockedData?.blocked) &&
                <Menu placement="bottom-end">
                    <MenuButton
                        as={IconButton}
                        icon={<MenuIcon />}
                        variant='outline'
                        className='!text-[#726fbb] !bg-[#f8f8ff]'
                    />
                    <MenuList className="!p-0 !rounded-xl !w-[120px]" align="end">
                        <MenuItem
                            className="hover:!bg-[#726fbb] !py-3 !rounded-xl !text-end !bg-[#f8f8ff] !text-[#726fbb] hover:!text-white"
                            onClick={() => handleClick(blockedData?.blocked ? 'Unblock' : 'Block')}
                        >
                            {blockedData?.blocked ? 'Unblock' : 'Block'}
                        </MenuItem>
                    </MenuList>
                </Menu>
            }
        </div>
    )
}

export default ChatHeader
